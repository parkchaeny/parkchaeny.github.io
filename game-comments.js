import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jzbwnqdkmtzveaiwylfb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YnducWRrbXR6dmVhaXd5bGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDcxOTMsImV4cCI6MjA4ODAyMzE5M30.aP5_pDTLHduVsEGjqyJJU8jaZbDWbYpzYlZDpkN9gec";

const widgets = Array.from(document.querySelectorAll(".game-comments"));

if (!widgets.length) {
  console.warn("game-comments.js: no widgets found");
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  const setStatus = (root, message, type = "") => {
    const statusEl = root.querySelector(".game-comment-status");
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.classList.remove("error", "success");
    if (type) {
      statusEl.classList.add(type);
    }
  };

  const getFriendlyError = (error) => {
    const message = String(error?.message || "");
    const lower = message.toLowerCase();

    if (lower.includes("relation") && lower.includes("comments")) {
      return "댓글 테이블이 없어. SQL 설정을 먼저 해줘!";
    }
    if (lower.includes("row-level security")) {
      return "Supabase 권한 설정(RLS)을 확인해줘.";
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

  const renderComments = (root, comments) => {
    const listEl = root.querySelector(".game-comment-list");
    const emptyEl = root.querySelector(".game-comment-empty");
    if (!listEl || !emptyEl) {
      return;
    }

    listEl.innerHTML = "";
    if (!comments.length) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    comments.forEach((comment) => {
      const item = document.createElement("li");
      item.className = "game-comment-item";

      const author = document.createElement("strong");
      author.className = "game-comment-author";
      author.textContent = comment.nickname || "익명";

      const body = document.createElement("p");
      body.className = "game-comment-body";
      body.textContent = comment.body;

      item.appendChild(author);
      item.appendChild(body);
      listEl.appendChild(item);
    });
  };

  const loadComments = async (root) => {
    const scope = root.dataset.commentScope;
    if (!scope) {
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .select("id, nickname, body, created_at")
      .eq("story_slug", scope)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    renderComments(root, data || []);
  };

  const getScoreText = (root) => {
    const scoreSourceId = root.dataset.scoreSource;
    if (!scoreSourceId) {
      return "점수 정보 없음";
    }
    const scoreEl = document.getElementById(scoreSourceId);
    if (!scoreEl) {
      return "점수 정보 없음";
    }
    return scoreEl.textContent?.trim() || "점수 정보 없음";
  };

  const initWidget = (root, user) => {
    const form = root.querySelector(".game-comment-form");
    const nicknameInput = root.querySelector(".game-comment-input");
    const bodyInput = root.querySelector(".game-comment-textarea");
    const submitBtn = form?.querySelector("button[type='submit']");
    const scope = root.dataset.commentScope;

    if (!form || !nicknameInput || !bodyInput || !submitBtn || !scope) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nickname = nicknameInput.value.trim() || "익명";
      const body = bodyInput.value.trim();
      const scoreText = getScoreText(root);

      if (!body) {
        setStatus(root, "댓글 내용을 써줘.", "error");
        bodyInput.focus();
        return;
      }

      const bodyWithScore = `${body}\n[${scoreText}]`;
      if (bodyWithScore.length > 500) {
        setStatus(root, "댓글이 너무 길어. 조금 줄여줘.", "error");
        return;
      }

      submitBtn.disabled = true;
      setStatus(root, "등록 중...");

      try {
        const { error } = await supabase.from("comments").insert({
          story_slug: scope,
          nickname,
          body: bodyWithScore,
          user_id: user.id,
        });
        if (error) {
          throw error;
        }

        bodyInput.value = "";
        await loadComments(root);
        setStatus(root, "댓글 등록 완료!", "success");
      } catch (error) {
        console.error(error);
        setStatus(root, getFriendlyError(error), "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  };

  const initialize = async () => {
    try {
      const user = await ensureAnonymousUser();

      await Promise.all(
        widgets.map(async (root) => {
          setStatus(root, "댓글 불러오는 중...");
          await loadComments(root);
          setStatus(root, "");
          initWidget(root, user);
        })
      );
    } catch (error) {
      console.error(error);
      widgets.forEach((root) => {
        setStatus(root, getFriendlyError(error), "error");
      });
    }
  };

  initialize();
}
