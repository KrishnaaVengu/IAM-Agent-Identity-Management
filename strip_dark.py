import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Match `dark:` followed by tailwind class characters
    # e.g. dark:bg-slate-900, dark:hover:bg-slate-800/60
    new_content = re.sub(r'\bdark:[a-zA-Z0-9\-\/:]+\b', '', content)
    
    # Clean up double spaces that might be left over
    new_content = re.sub(r'  +', ' ', new_content)
    
    # Clean up `className=" "` or `className="" `
    new_content = new_content.replace('className=" "', 'className=""')

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

def main():
    target_dir = '/home/blackpanther/Desktop/Agent_IAM/aim-frontend/src'
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
