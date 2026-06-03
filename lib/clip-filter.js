const VIEW_THRESHOLD = 6000;

const MEMBER_KEYWORDS = {
  嘉然: ["嘉然"],
  乃琳: ["乃琳"],
  贝拉: ["贝拉"],
  心宜: ["心宜"],
  思诺: ["思诺"],
};

const GROUP_KEYWORDS = {
  "A-SOUL": ["A-SOUL", "A-Soul", "asoul"],
  枝江: ["枝江", "枝江娱乐", "闪耀舞台"],
};

const TOPIC_KEYWORDS = {
  鸣潮: ["鸣潮"],
  战双: ["战双"],
};

function normalizeText(value) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function unique(values) {
  return [...new Set(values)];
}

function includesAnyKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function matchKeywordGroups(text, dictionary) {
  return Object.entries(dictionary)
    .filter(([, keywords]) => includesAnyKeyword(text, keywords))
    .map(([label]) => label);
}

export function getClipViewThreshold() {
  return VIEW_THRESHOLD;
}

export function getMemberMatches(text) {
  return matchKeywordGroups(text, MEMBER_KEYWORDS);
}

export function getGroupMatches(text) {
  return matchKeywordGroups(text, GROUP_KEYWORDS);
}

export function getTopicMatches(text) {
  return matchKeywordGroups(text, TOPIC_KEYWORDS);
}

export function getSourceCategory(source = {}) {
  if (source.group === "A-SOUL / Zhijiang") {
    return "core_clipper";
  }

  if (source.group === "game-related") {
    return "theme_clipper";
  }

  return "search_result";
}

function buildPriority(sourceCategory, source = {}) {
  const isFocused = typeof source.notes === "string" && source.notes.includes("重点关注");

  if (isFocused) {
    return "high";
  }

  if (sourceCategory === "core_clipper") {
    return "medium";
  }

  return "low";
}

export function evaluateClipCandidate({ source, title, description = "", viewCount }) {
  const combinedText = [title, description].filter(Boolean).join("\n");
  const sourceCategory = getSourceCategory(source);
  const matchedMembers = unique(getMemberMatches(combinedText));
  const matchedGroups = unique(getGroupMatches(combinedText));
  const matchedTopics = unique(getTopicMatches(combinedText));
  const priority = buildPriority(sourceCategory, source);

  if (Number(viewCount) < VIEW_THRESHOLD) {
    return {
      matchedMembers,
      matchedGroups,
      matchedTopics,
      sourceCategory,
      relevanceType: sourceCategory === "theme_clipper" ? "game_related" : "direct_zhijiang",
      filterPassed: false,
      filterReason: "rejected_below_view_threshold",
      priority,
    };
  }

  if (sourceCategory === "core_clipper") {
    return {
      matchedMembers,
      matchedGroups,
      matchedTopics,
      sourceCategory,
      relevanceType: matchedGroups.includes("枝江") ? "direct_zhijiang" : "direct_asoul",
      filterPassed: true,
      filterReason: "passed_core_clipper_threshold",
      priority,
    };
  }

  if (sourceCategory === "theme_clipper") {
    if (matchedMembers.length === 0 && matchedGroups.length === 0) {
      return {
        matchedMembers,
        matchedGroups,
        matchedTopics,
        sourceCategory,
        relevanceType: "game_related",
        filterPassed: false,
        filterReason: "rejected_missing_member_or_group_match",
        priority,
      };
    }

    if (matchedTopics.length === 0) {
      return {
        matchedMembers,
        matchedGroups,
        matchedTopics,
        sourceCategory,
        relevanceType: "game_related",
        filterPassed: false,
        filterReason: "rejected_missing_topic_match",
        priority,
      };
    }

    return {
      matchedMembers,
      matchedGroups,
      matchedTopics,
      sourceCategory,
      relevanceType: "game_related",
      filterPassed: true,
      filterReason: "passed_theme_clipper_topic_match",
      priority,
    };
  }

  if (matchedMembers.length > 0 || matchedGroups.length > 0) {
    return {
      matchedMembers,
      matchedGroups,
      matchedTopics,
      sourceCategory,
      relevanceType: matchedGroups.includes("枝江") ? "direct_zhijiang" : "direct_asoul",
      filterPassed: true,
      filterReason: "passed_search_result_match",
      priority,
    };
  }

  return {
    matchedMembers,
    matchedGroups,
    matchedTopics,
    sourceCategory,
    relevanceType: "other_related",
    filterPassed: false,
    filterReason: "rejected_irrelevant_search_result",
    priority,
  };
}
