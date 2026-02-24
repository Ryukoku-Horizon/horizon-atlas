async function notifyDiscord(title, description, color = 0x3498db) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not set");
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "HorizonAtlas",
      embeds: [{
        title: title,
        description: description,
        color: color, // 10進数のカラーコード
        timestamp: new Date().toISOString(),
        footer: { text: "HorizonAtlas System Notification" }
      }],
    }),
  });
}

(async () => {
  const token = process.env.ATLAS_STORAGE_GH_PAT;

  const res = await fetch(
    "https://api.github.com/repos/Ryukoku-Horizon/atlas-storage/actions/workflows/update-data.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    await notifyDiscord(
      "🚨 【緊急】Workflow実行失敗",
      "**horizon-atlas** からのデータ更新に失敗しました。\nGH_PATが期限切れの可能性があります。確認してください。",
      0xff0000
    );
    console.error(text);
  }

  const date = new Date();
  if ((date.getMonth() + 2) % 4 === 0 && date.getDate() === 1) {
    await notifyDiscord(
      "📅 【定期】PAT期限更新のお知らせ",
      "GitHub PATの期限を更新する時期です。\n[更新手順はこちら](https://www.notion.so/pat-2e0a501ef33780e7be6cef8a86802f2f)",
      0x3498db
    );
  }

  console.log("workflow dispatched");
})();
