#!/bin/sh
# Install dependencies
npm install

# Execute the command passed to the container
exec "$@"