#!/bin/bash

main() {
    if cp -p ~/smtp/templates /usr/local/bin/ && cp -p ~/smtp/smtp /usr/local/bin/; then
        if [[ -d /usr/local/bin/templates ]]; then
            echo "Installation successful"
            return 0
        else
            echo "Error: Templates directory not found after copy"
            return 1
        fi
    else
        echo "Error: Failed to copy files"
        return 1
    fi
}

if [[ -d /usr/local/bin/templates ]]; then
    python smtp
else
    if main; then
        python smtp
    else
        echo "Failed to install required files"
        exit 1
    fi
fi
