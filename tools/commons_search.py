"""Search Wikimedia Commons and save candidates (title, license, size, urls) as JSON.
Usage: python3 commons_search.py OUT.json "query1" "query2" ..."""
import json, sys, time, urllib.parse, urllib.request
UA = "mayowaofyt-video/1.0 (https://github.com/adeyanjumayor737-droid/mayowaofyt)"
OK = ("public domain", "cc0", "no restrictions", "pd", "cc by", "cc-by")
def get(url):
    for wait in (0, 15, 30, 60):
        time.sleep(wait)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return json.load(urllib.request.urlopen(req, timeout=60))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
    raise SystemExit("rate limited")
out, seen = [], set()
for q in sys.argv[2:]:
    p = {"action": "query", "format": "json", "generator": "search", "gsrsearch": q,
         "gsrnamespace": 6, "gsrlimit": 30, "prop": "imageinfo",
         "iiprop": "url|size|extmetadata|mime", "iiextmetadatafilter": "LicenseShortName|Artist|Credit",
         "iiurlwidth": 2400}
    d = get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p))
    for pg in sorted(d.get("query", {}).get("pages", {}).values(), key=lambda x: x["index"]):
        if pg["title"] in seen: continue
        i = pg["imageinfo"][0]; m = i.get("extmetadata", {})
        lic = m.get("LicenseShortName", {}).get("value", "")
        if i.get("mime") not in ("image/jpeg", "image/png", "image/tiff"): continue
        if not any(k in lic.lower() for k in OK): continue
        if i["width"] < 900: continue
        seen.add(pg["title"])
        out.append({"q": q, "title": pg["title"], "license": lic, "w": i["width"], "h": i["height"],
                    "thumb": i.get("thumburl"), "page": i["descriptionurl"],
                    "artist": m.get("Artist", {}).get("value", "")[:200]})
    time.sleep(3)
json.dump(out, open(sys.argv[1], "w"), indent=1)
print(len(out), "candidates")
