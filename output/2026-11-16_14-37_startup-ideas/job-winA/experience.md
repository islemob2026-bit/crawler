# Experience: indiehackers.com

- Check robots.txt first (rendered via browser, single tab). It is short and readable in the snapshot.
- Generic `User-agent: *` allows /products. Named AI crawlers (ClaudeBot, anthropic-ai, GPTBot, etc.) are fully disallowed. This blocked the job before any product page was visited.
- Next step if the user confirms: ask whether to proceed given the AI-crawler disallow, then crawl /products via rendered pages only.
