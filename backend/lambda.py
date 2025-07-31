import json
import boto3
import os
import re

# DynamoDB Setup
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE', 'CookieInsights')
table = dynamodb.Table(table_name)

# Bedrock (Claude) Setup
bedrock = boto3.client('bedrock-runtime')
model_id = "MY_MODEL_ID"  # Replace with actual model ID

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        cookie_name = body.get('cookie_name', 'unknown')
        domain = body.get('domain', 'unknown.com')
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid JSON format'})
        }

    # Step 1: Check DynamoDB
    try:
        response = table.get_item(Key={'cookie_name': cookie_name, 'domain': domain})
        if 'Item' in response:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps(response['Item'])
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'DynamoDB read failed: {str(e)}'})
        }

    # Step 2: Prompt Claude AI
    prompt = f"""
You are a privacy-focused AI assistant. Analyze the cookie "{cookie_name}" used on the domain "{domain}" and return:

- A brief explanation of its possible use
- A privacy category (e.g., Analytics, Advertisement, Authentication, Essential, Unknown)
- A risk score (Low, Medium, High) based on privacy sensitivity

Return JSON in this format:
{{"ai_explanation": "...", "category": "...", "risk_score": "..."}}
"""

    try:
        bedrock_response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 512,
                "temperature": 0.5
            }),
            contentType="application/json",
            accept="application/json"
        )

        raw = bedrock_response['body'].read().decode("utf-8")

        # Print/log raw output for debugging
        print("Raw Claude Output:", raw)

        # Parse the full response
        result = json.loads(raw)
        text_output = result['content'][0]['text'].strip()
        if text_output.startswith("```json"):
            text_output = re.sub(r"^```json\s*|\s*```$", "", text_output.strip())
        # Parse Claude's JSON string inside text
        ai_response = json.loads(text_output)

        ai_explanation = ai_response.get("ai_explanation", "Explanation not available.")
        category = ai_response.get("category", "Unknown")
        risk_score = ai_response.get("risk_score", "Medium")

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Claude AI call failed: {str(e)}'})
        }

    # Step 3: Save in DynamoDB
    try:
        table.put_item(Item={
            'cookie_name': cookie_name,
            'domain': domain,
            'ai_explanation': ai_explanation,
            'category': category,
            'risk_score': risk_score
        })
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'DynamoDB write failed: {str(e)}'})
        }

    # Step 4: Return the response
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps({
            'cookie_name': cookie_name,
            'domain': domain,
            'ai_explanation': ai_explanation,
            'category': category,
            'risk_score': risk_score
        })
    }
