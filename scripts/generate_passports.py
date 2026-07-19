#!/usr/bin/env python3
"""
Скрипт генерации и обогащения Цифровых Паспортов профессий (docs/23 и docs/24)
для файла app/data/professions_db.ts.
"""

import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), '../app/data/professions_db.ts')

def infer_passport_fields(name, industry, riasec):
    p_lower = name.lower()
    ind_lower = industry.lower()
    
    # 1. cognitiveDemand
    if any(k in ind_lower for k in ['наука', 'исследовани', 'ии', 'аналитика', 'космос', 'медицина', 'инженерия', 'юриспруденция', 'финансы']) or any(k in p_lower for k in ['врач', 'ученый', 'разработчик', 'инженер', 'аналитик', 'архитектор', 'исследователь', 'хирург']):
        cog = 'high'
    elif any(k in p_lower for k in ['слесарь', 'сварщик', 'курьер', 'водитель', 'оператор', 'кассир', 'маляр', 'штукатур']):
        cog = 'low'
    else:
        cog = 'medium'
        
    # 2. PVQ values (2-4 values)
    vals = []
    if 'Social' in riasec or any(k in p_lower for k in ['врач', 'учитель', 'психолог', 'педагог', 'акушер', 'мед']):
        vals.extend(['benevolence', 'universalism'])
    if 'Investigative' in riasec or cog == 'high':
        vals.extend(['self_direction', 'achievement'])
    if 'Enterprising' in riasec or any(k in p_lower for k in ['менеджер', 'продукт', 'директор', 'предприниматель', 'лидер']):
        vals.extend(['power', 'achievement', 'stimulation'])
    if 'Conventional' in riasec or any(k in p_lower for k in ['бухгалтер', 'аудитор', 'юрист', 'нотариус', 'аналитик']):
        vals.extend(['security', 'conformity'])
    if 'Artistic' in riasec or any(k in p_lower for k in ['дизайнер', 'художник', 'актер', 'артист', 'писатель']):
        vals.extend(['self_direction', 'stimulation'])
        
    if not vals:
        vals = ['achievement', 'security']
        
    unique_vals = list(dict.fromkeys(vals))[:4]
    
    # 3. VIA Fit (2-5 strengths)
    via = []
    if 'Investigative' in riasec or cog == 'high':
        via.extend(['curiosity', 'judgment', 'love_of_learning'])
    if 'Social' in riasec:
        via.extend(['kindness', 'social_intelligence', 'teamwork'])
    if 'Artistic' in riasec:
        via.extend(['creativity', 'appreciation_of_beauty', 'perspective'])
    if 'Enterprising' in riasec:
        via.extend(['leadership', 'zest', 'hope'])
    if 'Conventional' in riasec:
        via.extend(['prudence', 'perseverance', 'honesty'])
    if 'Realistic' in riasec:
        via.extend(['perseverance', 'self_regulation'])
        
    if not via:
        via = ['curiosity', 'perseverance', 'honesty']
        
    unique_via = list(dict.fromkeys(via))[:5]
    
    return cog, unique_vals, unique_via

def sanitize_summary_why(text):
    """Замена запрещенных слов ИИ на разрешенные синонимы только в summary/why (§6 Спецификация 23)"""
    text = re.sub(r'\bИИ\b', 'алгоритмы', text)
    text = re.sub(r'искусственный интеллект', 'цифровые системы', text, flags=re.IGNORECASE)
    text = re.sub(r'искусственного интеллекта', 'цифровых систем', text, flags=re.IGNORECASE)
    return text

def enrich_professions_db():
    # Восстанавливаем оригинальные отрасли
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace('Аналитика данных и алгоритмы', 'Аналитика данных и ИИ')
    content = content.replace('Оркестрация алгоритмы и Агенты', 'Оркестрация ИИ и Агенты')
    content = content.replace('Промпт-инженер (алгоритмы-инструктор)', 'Промпт-инженер (ИИ-инструктор)')
    content = content.replace('Аудитор алгоритмы-систем на безопасность', 'Аудитор ИИ-систем на безопасность')
    content = content.replace('Тренер алгоритмы по эмпатии', 'Тренер ИИ по эмпатии')
    content = content.replace('Инженер по оркестрации алгоритмы', 'Инженер по оркестрации ИИ')
    content = content.replace('Архитектор алгоритмы-агентов', 'Архитектор ИИ-агентов')

    records = content.split('  {\n    id:')
    header = records[0]
    
    new_records = [header]
    
    for rec in records[1:]:
        full_rec = '  {\n    id:' + rec
        
        name_match = re.search(r'name:\s*[\'\"]([^\'\"]+)[\'\"]', full_rec)
        ind_match = re.search(r'industry:\s*[\'\"]([^\'\"]+)[\'\"]', full_rec)
        riasec_match = re.search(r'riasec:\s*\[([^\]]+)\]', full_rec)
        
        if name_match and ind_match and riasec_match:
            name = name_match.group(1)
            ind = ind_match.group(1)
            riasec_str = riasec_match.group(1)
            riasec_list = [r.strip().strip('\'"') for r in riasec_str.split(',') if r.strip()]
            
            cog, vals, via = infer_passport_fields(name, ind, riasec_list)
            
            if 'cognitiveDemand:' not in full_rec:
                vals_str = ", ".join([f"'{v}'" for v in vals])
                via_str = ", ".join([f"'{v}'" for v in via])
                
                passport_block = f"    cognitiveDemand: '{cog}',\n    values: [{vals_str}],\n    viaFit: [{via_str}],\n"
                
                if '    subjects:' in full_rec:
                    full_rec = full_rec.replace('    subjects:', passport_block + '    subjects:')
                else:
                    full_rec = full_rec.replace('    summary:', passport_block + '    summary:')
        
        # Санитария только в summary и why
        summary_match = re.search(r'summary:\s*[\'\"]([^\'\"]+)[\'\"]', full_rec)
        if summary_match:
            old_s = summary_match.group(1)
            new_s = sanitize_summary_why(old_s)
            full_rec = full_rec.replace(old_s, new_s)

        why_match = re.search(r'why:\s*[\'\"]([^\'\"]+)[\'\"]', full_rec)
        if why_match:
            old_w = why_match.group(1)
            new_w = sanitize_summary_why(old_w)
            full_rec = full_rec.replace(old_w, new_w)

        new_records.append(full_rec.replace('  {\n    id:', '', 1) if new_records else full_rec)

    final_content = '  {\n    id:'.join(new_records)
    
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print('Successfully enriched professions_db.ts with digital passports!')

if __name__ == '__main__':
    enrich_professions_db()
