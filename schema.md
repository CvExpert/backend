# Database Schema

## Table: users
| Column    | Type               | Nullable |
|-----------|--------------------|----------|
| user_id   | text               | NO       |
| name      | text               | NO       |
| email     | text               | NO       |
| password  | character varying  | NO       |

## Table: analyze
| Column             | Type              | Nullable |
|--------------------|-------------------|----------|
| resume_score       | integer           | NO       |
| experience_score   | integer           | NO       |
| education_score    | integer           | NO       |
| achievement_score  | integer           | NO       |
| resume_style_score | integer           | NO       |
| experience         | text              | NO       |
| education          | text              | NO       |
| achievements       | text              | NO       |
| file_id            | character varying | NO       |

## Table: files
| Column       | Type              | Nullable |
|--------------|-------------------|----------|
| file_id      | character varying | NO       |
| user_id      | text              | NO       |
| file_link    | text              | NO       |
| project_name | text              | YES      |

## Table: my-migrations-table
| Column     | Type    | Nullable |
|------------|---------|----------|
| id         | integer | NO       |
| created_at | bigint  | YES      |
| hash       | text    | NO       |
