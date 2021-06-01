# proxy-with-nodejs
Testando modulo AnyProxy

## run
`npm start`

## test
`curl 'http://httpbin.org/user-agent' --proxy http://127.0.0.1:8001`
 - Expected:
`{
  "user-agent": "curl/7.58.0"
}
-- AnyProxy Hacked! --`
