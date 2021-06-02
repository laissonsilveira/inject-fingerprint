# proxy-with-nodejs
Testando modulo AnyProxy

## install
`npm i`

## run
`npm start`

### Error/Solutions

Caso receba a mensagem abaixo significa que é preciso instalar o certificado: 
*throw new Error('root CA not found. Please run `anyproxy-ca` to generate one first.');*

A instalação do certificado é feita utilizando o 'anyproxy'. Siga os paços a seguir:
Verifique se 'anyproxy' está instalado com o mando 
$ 'anyproxy --version'

Se não estiver, instale com o comando:
$ sudo npm install -g anyproxy

E crie o certificado com o comando:
$ anyproxy-ca

Será perguntado: '? Would you like to generate one ?', responda com 'Yes'

Após a instalação do certificado o ao executar o comando 'npm start' o erro não deverá ocorrer.

## test
`curl --insecure 'https://www.facebook.com/' -x http://127.0.0.1:8001`
 - Expected:
 `<script>window.navigator.teste = "laisson"</script>` após o `<head>`
 ![Result](face_html.png)

## doc
https://anyproxy.io/
