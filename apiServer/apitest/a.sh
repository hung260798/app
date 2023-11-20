products=:3000/products
categories=:3000/categories
customers=:3000/customers

# http $products/;
# echo ------------------------;
# http $categories;

http $customers/myaccount id=="4954c0ba2832ec66cbf274e2" fields=="phone,firstName,lastName"