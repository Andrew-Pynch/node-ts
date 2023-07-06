#!/bin/sh

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "From=15039302186&Body=$1" http://localhost:3000/sms
