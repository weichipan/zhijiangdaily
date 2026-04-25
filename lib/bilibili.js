function decodeText(text = "") {
  return typeof text === "string" ? text : "";
}

function cookieHeader(cookie) {
  return cookie ? { Cookie: cookie } : {};
}

async function fetchJson(url, { cookie } = {}) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      Referer: "https://www.bilibili.com/",
      ...cookieHeader(cookie),
    },
    next: { revalidate: 0 },
  });

  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

export async function fetchLiveSource(source, cookie) {
  const [masterRes, roomRes] = await Promise.all([
    fetchJson(`https://api.live.bilibili.com/live_user/v1/Master/info?uid=${source.uid}`, { cookie }),
    fetchJson(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${source.roomId}`, { cookie }),
  ]);

  const master = JSON.parse(masterRes.text);
  const room = JSON.parse(roomRes.text);

  if (master.code !== 0 || room.code !== 0) {
    throw new Error(`直播源抓取失败：${source.label}`);
  }

  const uname = decodeText(master.data.info.uname);
  const title = decodeText(room.data.title);
  const areaName = decodeText(room.data.area_name);
  const hotWords = (room.data.hot_words || []).map((word) => decodeText(word));

  return {
    sourceId: source.id,
    sourceType: source.type,
    sourceUid: source.uid,
    label: source.label,
    memberName: uname,
    url: `https://live.bilibili.com/${source.roomId}`,
    cover: room.data.user_cover || master.data.info.face,
    publishTime: new Date().toISOString(),
    title,
    textContent: `${uname} 当前直播状态为 ${room.data.live_status}，分区 ${areaName}`,
    metrics: {
      followerNum: master.data.follower_num,
      online: room.data.online,
      liveStatus: room.data.live_status,
      areaName,
      hotWords,
      roomId: source.roomId,
    },
    rawPayload: {
      master: master.data,
      room: room.data,
    },
    dedupeKey: `${source.type}:${source.uid}:${source.roomId}`,
  };
}

export async function fetchSpaceSnapshot(source, cookie) {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      Referer: "https://www.bilibili.com/",
      ...cookieHeader(cookie),
    },
    next: { revalidate: 0 },
  });

  const html = await response.text();

  if (!response.ok || html.includes("错误码：412")) {
    throw new Error(`${source.label} 页面被风控或请求失败`);
  }

  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/_哔哩哔哩_bilibili/i, "").trim() : source.label;
  const coverMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
  const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);

  return {
    sourceId: source.id,
    sourceType: source.type,
    sourceUid: source.uid || "",
    label: source.label,
    memberName: title,
    url: source.url,
    cover: coverMatch?.[1] || "",
    publishTime: new Date().toISOString(),
    title,
    textContent: descMatch?.[1] || `${source.label} 页面抓取成功`,
    metrics: {},
    rawPayload: {
      title,
    },
    dedupeKey: `${source.type}:${source.uid || source.url}`,
  };
}

export async function fetchSource(source, cookie) {
  if (source.type === "member_live") {
    return fetchLiveSource(source, cookie);
  }

  return fetchSpaceSnapshot(source, cookie);
}
