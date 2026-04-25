const fs = require('fs');

const collection = {
  "info": {
    "name": "VendorConnect India end-to-end flows",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. AUTHENTICATION FLOW",
      "item": [
        {
          "name": "REGISTER",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "pm.test(\"Returns JWT token\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.token).to.exist;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Ravi Kumar\",\n  \"email\": \"ravi@vendor.com\",\n  \"password\": \"Test@1234\",\n  \"role\": \"vendor\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/auth/register", "host": ["{{base_url}}"], "path": ["api", "auth", "register"] }
          }
        },
        {
          "name": "LOGIN",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Returns JWT token and saves it\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.token).to.exist;",
                  "    pm.environment.set(\"auth_token\", jsonData.token);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"ravi@vendor.com\",\n  \"password\": \"Test@1234\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"] }
          }
        }
      ]
    },
    {
      "name": "2. VENDOR SHOP SETUP FLOW",
      "item": [
        {
          "name": "CREATE SHOP",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "pm.test(\"Shop object returned with shopId\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.shopId || jsonData._id || jsonData.id).to.exist;",
                  "    var id = jsonData.shopId || jsonData._id || jsonData.id;",
                  "    pm.environment.set(\"shop_id\", id);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"shopName\": \"Ravi's Chai Corner\",\n  \"category\": \"Food & Beverages\",\n  \"location\": {\n    \"lat\": 17.385044,\n    \"lng\": 78.486671\n  },\n  \"upiId\": \"ravi@upi\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/vendor/shop", "host": ["{{base_url}}"], "path": ["api", "vendor", "shop"] }
          }
        },
        {
          "name": "GET SHOP DETAILS",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Full shop object returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.shopName).to.exist;",
                  "    pm.expect(jsonData.category).to.exist;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" }
            ],
            "url": { "raw": "{{base_url}}/api/vendor/shop/{{shop_id}}", "host": ["{{base_url}}"], "path": ["api", "vendor", "shop", "{{shop_id}}"] }
          }
        },
        {
          "name": "UPDATE SHOP",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Updated shop returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.shopName || (jsonData.shop && jsonData.shop.shopName)).to.include(\"Ravi's Special Chai Corner\");",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PUT",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"shopName\": \"Ravi's Special Chai Corner\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/vendor/shop/{{shop_id}}", "host": ["{{base_url}}"], "path": ["api", "vendor", "shop", "{{shop_id}}"] }
          }
        }
      ]
    },
    {
      "name": "3. PRODUCT / MENU FLOW",
      "item": [
        {
          "name": "ADD PRODUCT",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "pm.test(\"Product object with productId returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.productId || jsonData._id || jsonData.id).to.exist;",
                  "    var id = jsonData.productId || jsonData._id || jsonData.id;",
                  "    pm.environment.set(\"product_id\", id);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Masala Chai\",\n  \"price\": 15,\n  \"description\": \"Hot and spicy chai\",\n  \"available\": true\n}"
            },
            "url": { "raw": "{{base_url}}/api/vendor/shop/{{shop_id}}/product", "host": ["{{base_url}}"], "path": ["api", "vendor", "shop", "{{shop_id}}", "product"] }
          }
        },
        {
          "name": "GET ALL PRODUCTS",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Array of products returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(Array.isArray(jsonData) || Array.isArray(jsonData.products)).to.be.true;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "url": { "raw": "{{base_url}}/api/vendor/shop/{{shop_id}}/products", "host": ["{{base_url}}"], "path": ["api", "vendor", "shop", "{{shop_id}}", "products"] }
          }
        },
        {
          "name": "UPDATE PRODUCT",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Updated product returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    var p = jsonData.product || jsonData;",
                  "    pm.expect(p.price).to.equal(20);",
                  "    pm.expect(p.available).to.be.false;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PUT",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"price\": 20,\n  \"available\": false\n}"
            },
            "url": { "raw": "{{base_url}}/api/vendor/product/{{product_id}}", "host": ["{{base_url}}"], "path": ["api", "vendor", "product", "{{product_id}}"] }
          }
        },
        {
          "name": "DELETE PRODUCT",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "DELETE",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" }
            ],
            "url": { "raw": "{{base_url}}/api/vendor/product/{{product_id}}", "host": ["{{base_url}}"], "path": ["api", "vendor", "product", "{{product_id}}"] }
          }
        }
      ]
    },
    {
      "name": "4. LIVE VENDOR DISCOVERY FLOW",
      "item": [
        {
          "name": "GET NEARBY VENDORS",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Array of vendors returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    var v = jsonData.vendors || jsonData;",
                  "    pm.expect(Array.isArray(v)).to.be.true;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/vendors/nearby?lat=17.385044&lng=78.486671&radius=5",
              "host": ["{{base_url}}"],
              "path": ["api", "vendors", "nearby"],
              "query": [
                { "key": "lat", "value": "17.385044" },
                { "key": "lng", "value": "78.486671" },
                { "key": "radius", "value": "5" }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "5. UPI PAYMENT FLOW",
      "item": [
        {
          "name": "INITIATE PAYMENT",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Returns paymentId and UPI deep link\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.paymentId || jsonData._id || jsonData.id).to.exist;",
                  "    var id = jsonData.paymentId || jsonData._id || jsonData.id;",
                  "    pm.environment.set(\"payment_id\", id);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"shopId\": \"{{shop_id}}\",\n  \"amount\": 45,\n  \"items\": [\n    { \"productId\": \"{{product_id}}\", \"quantity\": 3 }\n  ],\n  \"upiId\": \"customer@upi\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/payment/initiate", "host": ["{{base_url}}"], "path": ["api", "payment", "initiate"] }
          }
        },
        {
          "name": "VERIFY PAYMENT",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"paymentId\": \"{{payment_id}}\",\n  \"status\": \"SUCCESS\",\n  \"transactionId\": \"TXN123456789\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/payment/verify", "host": ["{{base_url}}"], "path": ["api", "payment", "verify"] }
          }
        },
        {
          "name": "GET RECEIPT",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Receipt object returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.amount).to.exist;",
                  "    pm.expect(jsonData.items).to.exist;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" }
            ],
            "url": { "raw": "{{base_url}}/api/payment/receipt/{{payment_id}}", "host": ["{{base_url}}"], "path": ["api", "payment", "receipt", "{{payment_id}}"] }
          }
        }
      ]
    },
    {
      "name": "6. REVIEW & SENTIMENT ANALYSIS FLOW",
      "item": [
        {
          "name": "SUBMIT REVIEW",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "pm.test(\"Returns sentiment result\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.sentiment).to.exist;",
                  "    pm.expect(jsonData.confidence).to.exist;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"shopId\": \"{{shop_id}}\",\n  \"rating\": 4,\n  \"reviewText\": \"Amazing chai, very fast service and friendly vendor!\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/review/submit", "host": ["{{base_url}}"], "path": ["api", "review", "submit"] }
          }
        },
        {
          "name": "GET ALL REVIEWS FOR SHOP",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Array of reviews returned\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    var r = jsonData.reviews || jsonData;",
                  "    pm.expect(Array.isArray(r)).to.be.true;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "url": { "raw": "{{base_url}}/api/review/shop/{{shop_id}}", "host": ["{{base_url}}"], "path": ["api", "review", "shop", "{{shop_id}}"] }
          }
        },
        {
          "name": "GET SENTIMENT SUMMARY",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test(\"Sentiment summary aggregates correctly\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.positive).to.exist;",
                  "    pm.expect(jsonData.totalReviews).to.exist;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "url": { "raw": "{{base_url}}/api/review/shop/{{shop_id}}/sentiment-summary", "host": ["{{base_url}}"], "path": ["api", "review", "shop", "{{shop_id}}", "sentiment-summary"] }
          }
        }
      ]
    },
    {
      "name": "7. NEGATIVE / EDGE CASE TESTING",
      "item": [
        {
          "name": "LOGIN WITH WRONG PASSWORD",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 401\", function () {",
                  "    pm.response.to.have.status(401);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"ravi@vendor.com\",\n  \"password\": \"wrongpass\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"] }
          }
        },
        {
          "name": "ACCESS PROTECTED ROUTE WITHOUT TOKEN",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 401 or 403\", function () {",
                  "    pm.expect(pm.response.code).to.be.oneOf([401, 403]);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "url": { "raw": "{{base_url}}/api/vendor/shop/{{shop_id}}", "host": ["{{base_url}}"], "path": ["api", "vendor", "shop", "{{shop_id}}"] }
          }
        },
        {
          "name": "SUBMIT EMPTY REVIEW",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 400\", function () {",
                  "    pm.response.to.have.status(400);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{auth_token}}" },
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"shopId\": \"{{shop_id}}\",\n  \"reviewText\": \"\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/review/submit", "host": ["{{base_url}}"], "path": ["api", "review", "submit"] }
          }
        },
        {
          "name": "GET VENDORS WITH INVALID COORDINATES",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 400\", function () {",
                  "    pm.response.to.have.status(400);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/vendors/nearby?lat=abc&lng=xyz",
              "host": ["{{base_url}}"],
              "path": ["api", "vendors", "nearby"],
              "query": [
                { "key": "lat", "value": "abc" },
                { "key": "lng", "value": "xyz" }
              ]
            }
          }
        }
      ]
    }
  ]
};

const environment = {
  "id": "vendorconnect-env-" + Date.now(),
  "name": "VendorConnect Local",
  "values": [
    { "key": "base_url", "value": "http://localhost:5000", "type": "default", "enabled": true },
    { "key": "auth_token", "value": "", "type": "default", "enabled": true },
    { "key": "shop_id", "value": "", "type": "default", "enabled": true },
    { "key": "product_id", "value": "", "type": "default", "enabled": true },
    { "key": "payment_id", "value": "", "type": "default", "enabled": true }
  ]
};

fs.writeFileSync('VendorConnect.postman_collection.json', JSON.stringify(collection, null, 2));
fs.writeFileSync('VendorConnect.postman_environment.json', JSON.stringify(environment, null, 2));

console.log('Postman Collection and Environment generated!');
