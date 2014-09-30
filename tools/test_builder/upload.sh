#!/bin/bash

curl "http://localhost:1337/api/reset"
curl "http://localhost:1337/api/upload" -d "@tests/$1/Complete.json" -H "Content-Type: application/json"
