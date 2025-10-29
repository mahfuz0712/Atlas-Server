import axios from "axios";

export class Github {
  constructor(username, token) {
    this.username = username;
    this.token = token;
  }

  get headers() {
    return {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github+json",
    };
  }

  async repoInfo(repoName) {
    try {
      const repoRes = await axios.get(
        `https://api.github.com/repos/${this.username}/${repoName}`,
        { headers: this.headers }
      );
      const repoData = repoRes.data;

      // Parallel requests
      const [
        readmeRes,
        contributorsRes,
        releasesRes,
        logoRes,
      ] = await Promise.all([
        axios
          .get(
            `https://api.github.com/repos/${this.username}/${repoName}/readme`,
            { headers: this.headers }
          )
          .catch(() => null),
        axios
          .get(
            `https://api.github.com/repos/${this.username}/${repoName}/contributors`,
            { headers: this.headers }
          )
          .catch(() => null),
        axios
          .get(
            `https://api.github.com/repos/${this.username}/${repoName}/releases`,
            { headers: this.headers }
          )
          .catch(() => null),
        axios
          .get(
            `https://api.github.com/repos/${this.username}/${repoName}/contents/public/icons/icon.png`,
            { headers: this.headers }
          )
          .catch(() => null),
      ]);

      return {
        name: repoData.name,
        fullName: repoData.full_name,
        visibility: repoData.private ? "private" : "public",
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        license: repoData.license?.name || null,
        sizeKB: repoData.size,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at,
        contributors: contributorsRes?.data?.map((c) => c.login) || [],
        releases: releasesRes?.data?.map((r) => r.tag_name) || [],
        readmeDownloadUrl: readmeRes?.data?.download_url || null,
        url: repoData.html_url,
        logoUrl: logoRes?.data?.download_url || "/uploads/icons/mahfuz.png",
        assets: await this.repoAssets(repoName)
      };
    } catch (error) {
      console.error("Repo info error:", error.message);
      return null;
    }
  }

  async repoAssets(repoName) {
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${this.username}/${repoName}/releases/latest`,
        { headers: this.headers }
      );
      const assets = res.data.assets;

      if (!assets?.length) return null;

      return assets.map((asset) => {
        const name = asset.name.toLowerCase();
        let osType = "unknown";
        if (name.endsWith(".exe") || name.endsWith(".msi")) osType = "windows";
        else if (name.endsWith(".appimage") || name.endsWith(".deb") || name.endsWith(".tar.gz"))
          osType = "linux";
        else if (name.endsWith(".dmg") || name.endsWith(".pkg")) osType = "mac";
        else if (name.endsWith(".apk")) osType = "android";
        else if (name.endsWith(".zip") || name.endsWith(".7z") || name.endsWith(".tar")) osType = "archive";
        else if (name.endsWith(".ipa")) osType = "ios";
        return {
          name: asset.name,
          url: asset.browser_download_url,
          osType,
        };
      });
    } catch (err) {
      console.error("Release assets error:", err.message);
      return null;
    }
  }
}

