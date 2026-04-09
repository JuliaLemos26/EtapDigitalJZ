import os

files_to_update = [
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\home\templates\pages\tarefas.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\home\templates\pages\projetos.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\home\templates\pages\home.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\home\templates\pages\eventos.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\home\templates\pages\lojinha.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\lojinha.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\tarefas.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\projetos.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\home.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\formpost.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\eventos.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\concursos.html",
    r"c:\Users\Zafira\Desktop\EtapDigitalPAP\core\templates\pages\angariacoes.html"
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    import re
    # We want to replace <div class="score-display"> ... </div> with the new block.
    # The block might have different spacing.
    # Example block to find:
    # <div class="score-display">
    #    <i class='bx  bx-star'    ></i>    120
    # </div>
    # Using regex to find <div class="score-display"> ... </div>
    pattern = re.compile(r'(<div class="score-display">.*?</div>)', re.DOTALL)
    
    # We shouldn't replace it if it's already wrapped in {% if user.is_authenticated and user.aluno_profile %}
    if "{% if user.is_authenticated and user.aluno_profile %}" in content:
        print(f"Skipping {file_path}, already updated.")
        continue

    def replacement(match):
        return "{% if user.is_authenticated and user.aluno_profile %}\n" + \
               match.group(1).replace("120", "{{ user.aluno_profile.pontos }}") + \
               "\n{% endif %}"
               
    new_content = pattern.sub(replacement, content)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Updated {file_path}")
