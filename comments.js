import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jzbwnqdkmtzveaiwylfb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YnducWRrbXR6dmVhaXd5bGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDcxOTMsImV4cCI6MjA4ODAyMzE5M30.aP5_pDTLHduVsEGjqyJJU8jaZbDWbYpzYlZDpkN9gec";

const storySlug = document.body?.dataset?.storySlug;
const listEl = document.getElementById("comment-list");
const emptyEl = document.getElementById("comment-empty");
const formEl = document.getElementById("comment-form");
const nicknameEl = document.getElementById("comment-nickname");
const bodyEl = document.getElementById("comment-body");
const statusEl = document.getElementById("comment-status");

if (!storySlug || !listEl || !emptyEl || !formEl || !nicknameEl || !bodyEl || !statusEl) {
  console.warn("comments.js: comment elements not found");
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  const setStatus = (message, type = "") => {
    statusEl.textContent = message;
    statusEl.classList.remove("error", "success");
    if (type) {
      statusEl.classList.add(type);
    }
  };

  const renderComments = (comments) => {
    listEl.innerHTML = "";

    if (!comments.length) {
      emptyEl.style.display = "block";
      return;
    }

    emptyEl.style.display = "none";

    comments.forEach((comment) => {
      const item = document.createElement("li");
      item.className = "comment-item";

      const header = document.createElement("div");
      header.className = "comment-header";

      const author = document.createElement("strong");
      author.className = "comment-author";
      author.textContent = comment.nickname || "익명";
      header.appendChild(author);

      const body = document.createElement("p");
      body.className = "comment-body";
      body.textContent = comment.body;

      item.appendChild(header);
      item.appendChild(body);
      listEl.appendChild(item);
    });
  };

  const getFriendlyError = (error) => {
    const message = String(error?.message || "");
    const lower = message.toLowerCase();

    if (lower.includes("relation") && lower.includes("comments")) {
      return "Supabase에 comments 테이블이 없어. SQL 파일을 먼저 실행해줘!";
    }
    if (lower.includes("row-level security")) {
      return "권한 설정(RLS)을 확인해줘.";
    }
    if (lower.includes("anonymous") && lower.includes("disabled")) {
      return "Supabase에서 Anonymous 로그인을 켜줘.";
    }
    if (lower.includes("jwt")) {
      return "Supabase 키 설정을 확인해줘.";
    }

    return "댓글 처리 중 오류가 났어. 잠시 후 다시 시도해줘.";
  };

  const ensureAnonymousUser = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }
    if (sessionData?.session?.user) {
      return sessionData.session.user;
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw error;
    }

    if (!data?.user) {
      throw new Error("anonymous user not found");
    }
    return data.user;
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, nickname, body, created_at")
      .eq("story_slug", storySlug)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    renderComments(data || []);
  };

  const initialize = async () => {
    setStatus("댓글 불러오는 중...");
    try {
      await ensureAnonymousUser();
      await loadComments();
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus(getFriendlyError(error), "error");
    }
  };

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nickname = nicknameEl.value.trim() || "익명";
    const body = bodyEl.value.trim();

    if (!body) {
      setStatus("댓글 내용을 써줘.", "error");
      bodyEl.focus();
      return;
    }

    const submitButton = formEl.querySelector("button[type='submit']");
    submitButton.disabled = true;
    setStatus("등록 중...");

    try {
      const user = await ensureAnonymousUser();

      const { error } = await supabase.from("comments").insert({
        story_slug: storySlug,
        nickname,
        body,
        user_id: user.id,
      });

      if (error) {
        throw error;
      }

      bodyEl.value = "";
      await loadComments();
      setStatus("댓글 등록 완료!", "success");
    } catch (error) {
      console.error(error);
      setStatus(getFriendlyError(error), "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  initialize();
}
