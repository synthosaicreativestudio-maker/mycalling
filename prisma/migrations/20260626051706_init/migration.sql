-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(100) NOT NULL,
    "grade" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "diagnostic_tests" (
    "test_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "diagnostic_tests_pkey" PRIMARY KEY ("test_id")
);

-- CreateTable
CREATE TABLE "diagnostic_questions" (
    "question_id" VARCHAR(50) NOT NULL,
    "test_id" VARCHAR(50) NOT NULL,
    "question_text" TEXT NOT NULL,
    "scale_code" VARCHAR(10) NOT NULL,
    "is_reverse" BOOLEAN NOT NULL DEFAULT false,
    "visual_asset_url" VARCHAR(255) NOT NULL,
    "ai_generation_prompt" TEXT,

    CONSTRAINT "diagnostic_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "diagnostic_sessions" (
    "session_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "test_id" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "user_diagnostic_answers" (
    "answer_id" BIGSERIAL NOT NULL,
    "session_id" UUID NOT NULL,
    "question_id" VARCHAR(50) NOT NULL,
    "raw_answer_value" INTEGER NOT NULL,
    "time_spent_ms" INTEGER NOT NULL,
    "is_fraud" BOOLEAN NOT NULL DEFAULT false,
    "is_fast_click" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_diagnostic_answers_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "diagnostic_results" (
    "result_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "calculated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validity_index" DECIMAL(3,2) NOT NULL,
    "raw_scores" JSONB NOT NULL,
    "standard_scores" JSONB NOT NULL,

    CONSTRAINT "diagnostic_results_pkey" PRIMARY KEY ("result_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_diagnostic_answers_session_id_question_id_key" ON "user_diagnostic_answers"("session_id", "question_id");

-- AddForeignKey
ALTER TABLE "diagnostic_questions" ADD CONSTRAINT "diagnostic_questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "diagnostic_tests"("test_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_sessions" ADD CONSTRAINT "diagnostic_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_sessions" ADD CONSTRAINT "diagnostic_sessions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "diagnostic_tests"("test_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_diagnostic_answers" ADD CONSTRAINT "user_diagnostic_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnostic_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_diagnostic_answers" ADD CONSTRAINT "user_diagnostic_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "diagnostic_questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnostic_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;
