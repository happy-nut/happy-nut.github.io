#!/usr/bin/env bash
# 글쓰기 앱의 GitHub 로그인 중계를 zoobox AWS(ap-northeast-2)에 올린다. 몇 번 돌려도 같은 상태가 된다.
#   bash tools/blog-auth/deploy.sh        # 만들거나 코드만 갱신하고 Function URL 을 찍는다
# 처음 한 번은 찍힌 URL 의 /setup 을 GitHub 에 로그인된 브라우저로 열어 GitHub 앱을 만들고 저장소에 설치한다.
set -euo pipefail
export AWS_PROFILE=${AWS_PROFILE:-zoobox-infra} AWS_REGION=${AWS_REGION:-ap-northeast-2} AWS_PAGER=""
FN=happynut-blog-auth ROLE=happynut-blog-auth-lambda PARAM=/blog-auth/github-app
cd "$(dirname "$0")"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

if ! aws iam get-role --role-name $ROLE >/dev/null 2>&1; then
  aws iam create-role --role-name $ROLE --tags Key=Project,Value=happynut-blog \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null
  aws iam attach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  sleep 10 # IAM 전파
fi
aws iam put-role-policy --role-name $ROLE --policy-name ssm-github-app --policy-document \
  "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"ssm:GetParameter\",\"ssm:PutParameter\"],\"Resource\":\"arn:aws:ssm:$AWS_REGION:$ACCOUNT:parameter$PARAM\"}]}"

ZIP=$(mktemp -d)/fn.zip && zip -qj "$ZIP" index.mjs
if aws lambda get-function --function-name $FN >/dev/null 2>&1; then
  aws lambda update-function-code --function-name $FN --zip-file "fileb://$ZIP" >/dev/null
else
  aws lambda create-function --function-name $FN --runtime nodejs22.x --handler index.handler --timeout 10 --memory-size 256 \
    --role arn:aws:iam::$ACCOUNT:role/$ROLE --zip-file "fileb://$ZIP" --tags Project=happynut-blog >/dev/null
  aws lambda wait function-active-v2 --function-name $FN
fi

CORS='{"AllowOrigins":["https://happy-nut.github.io","http://127.0.0.1:4100","http://localhost:4000"],"AllowMethods":["POST"],"AllowHeaders":["content-type"],"MaxAge":3600}'
if aws lambda get-function-url-config --function-name $FN >/dev/null 2>&1; then
  aws lambda update-function-url-config --function-name $FN --auth-type NONE --cors "$CORS" >/dev/null
else
  aws lambda create-function-url-config --function-name $FN --auth-type NONE --cors "$CORS" >/dev/null
  aws lambda add-permission --function-name $FN --statement-id public-url --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE >/dev/null
  aws lambda add-permission --function-name $FN --statement-id public-invoke --action lambda:InvokeFunction --principal '*' --invoked-via-function-url >/dev/null 2>&1 || true
fi
aws lambda get-function-url-config --function-name $FN --query FunctionUrl --output text
