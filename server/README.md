In deployment the DMA_data and geojson files will be on the server.
In testing I need a way to serve them conveniently so
I run http-server in Node.

== How to run a simple HTTP server

https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http

== Start up

npx http-server -o `pwd`/DMA_data

== URL

http://192.168.123.2:8080/DMA_data


