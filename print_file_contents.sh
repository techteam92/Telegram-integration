#!/bin/bash
start_dir="."

print_contents() {
    for file in "$1"/*; do
        if [ -d "$file" ]; then
            if [[ "$file" =~ "node_modules" ]]; then
                continue
            fi
            print_contents "$file"
        elif [ -f "$file" ]; then
            filename=$(basename "$file")
            if [[ "$filename" == "print_file_contents.sh" || "$filename" == "package-lock.json" ]]; then
                continue
            fi
            echo "==> $file <=="
            cat "$file"
            echo -e "\n---\n"
        fi
    done
}

print_contents "$start_dir"
