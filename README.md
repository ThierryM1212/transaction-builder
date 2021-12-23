# [Ergo](https://ergoplatform.org/) Transaction builder

## Features
Manipulate ergo transaction input and output boxes to build transactions.<br/>
Import export transactions.<br/>

Try it at: https://transaction-builder.ergo.ga/

## Usage
$ git clone https://github.com/ThierryM1212/transaction-builder.git<br/>
$ cd transaction-builder<br/>
$ npm install<br/>
$ npm start<br/>

# Build static prod version
$ npm run build

# Apache proxy configuration to open the node used URLs
```
    <Location "/blocks">
        ProxyPreserveHost On
        ProxyPass http://localhost:9053/blocks/lastHeaders/10
        ProxyPassReverse http://localhost:9053/blocks/lastHeaders/10
    </Location>

    <Location "/transactions">
        ProxyPreserveHost On
        ProxyPass http://localhost:9053/transactions
        ProxyPassReverse http://localhost:9053/transactions
        RequestHeader set api_key "YOUR_API_KEY"
    </Location>

```
