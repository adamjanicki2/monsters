import os


extensions = ".tsx", ".ts", ".json", ".html"
ignore_files = ("Footer.tsx",)

def success(message):
    print(f"\033[92m{message}\033[0m")


def info(message):
    print(f"\033[96m{message}\033[0m")


def find_files():
    files = []
    for root, dirs, filenames in os.walk("."):
        if "node_modules" in root:
            continue
        for filename in filenames:
            if filename.endswith(extensions) and not filename.endswith(ignore_files):
                files.append(os.path.join(root, filename))
    return files


def replace_strings(files, replacements):
    for file in files:            
        with open(file, "r+") as f:
            content = f.read()
            for cur, sub in replacements:
                content = content.replace(cur, sub)
            f.seek(0)
            f.write(content)
            f.truncate()


def replace_readme(project_name, description):
    with open("README.md", "w") as f:
        f.write(f"# {project_name}\n\n{description}")

def main():
    repo_name = ""
    while not repo_name:
        repo_name = input("What is the name of your repository?\n(e.g. react-skeleton)\n>>> ").strip().replace(" ", "-").lower()

    project_name = ""
    while not project_name:
        project_name = input("What is the name of your project?\n(e.g. React Skeleton)\n>>> ").strip()
    
    description = ""
    while not description:
        description = input("What is the description of your project?\n>>> ").strip()

    print(f"Setting up {project_name}...")
    replace_readme(project_name, description)
    files = find_files()
    replacements = [
        ("react-skeleton", repo_name),
        ("React Skeleton", project_name),
        ("Site built from React skeleton", description)
    ]
    replace_strings(files, replacements)
    success("Autoreplaced strings in files!")
    print("Installing npm dependencies...")
    os.system("npm install")
    success("Installed npm dependencies!")
    print("Cleaning up...")
    os.remove(__file__)
    success("Finished setting up!")
    info("Run `npm start` to start the development server.")


if __name__ == "__main__":
    main()
