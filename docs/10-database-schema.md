# Database Schema v1

## users
- id
- created_at
- email
- telegram
- role_hint

## student_profiles
- id
- user_id
- full_name
- grade
- city
- school
- age

## assessment_sessions
- id
- user_id
- started_at
- completed_at
- status
- version

## questions
- id
- section
- type
- prompt
- options_json
- weight
- active

## answers
- id
- session_id
- question_id
- answer_value
- score_value

## competencies
- id
- code
- name
- category
- description

## competency_scores
- id
- session_id
- competency_id
- score
- level

## professions
- id
- slug
- name
- summary
- category

## profession_competencies
- id
- profession_id
- competency_id
- weight

## profession_matches
- id
- session_id
- profession_id
- match_score
- rationale

## subject_recommendations
- id
- session_id
- subject_name
- priority
- rationale

## direction_recommendations
- id
- session_id
- direction_name
- priority
- rationale
