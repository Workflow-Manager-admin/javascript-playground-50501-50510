#!/bin/bash
cd /home/kavia/workspace/code-generation/javascript-playground-50501-50510/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

