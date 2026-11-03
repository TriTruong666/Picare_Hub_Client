"""Run on the authorized VPS after copying this directory to /tmp.

Only the Hub vhost is changed. Validate the whole gateway before reloading;
restore both files on validation failure. Docker manages its existing RW mount.
"""
from pathlib import Path
import datetime
import shutil
import subprocess

directory = Path.home() / "projects/nginx-gateway/conf.d"
config = directory / "picare-hub-client.conf"
limits = directory / "01-picare-hub-delivery-limits.conf"
stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
backup = Path.home() / ".picare-backups/nginx" / stamp
backup.mkdir(parents=True)
shutil.copy2(config, backup / config.name)
existed = limits.exists()
if existed:
    shutil.copy2(limits, backup / limits.name)
subprocess.run([
    "docker", "cp", str(Path(__file__).with_name("hub-delivery-limits.conf")),
    "nginx-gateway:/etc/nginx/conf.d/" + limits.name,
], check=True)
content = config.read_text()
if "zone=picare_hub_assets" not in content:
    offset = content.index("listen 443 ssl;")
    offset = content.index("server_name hub.picare.vn;", offset) + len("server_name hub.picare.vn;")
    content = content[:offset] + """
    limit_req zone=picare_hub_assets burst=120 nodelay;
    limit_req_status 429;
    limit_req_log_level warn;
    access_log /var/log/nginx/access.log picare_hub_delivery;""" + content[offset:]
    config.write_text(content)
result = subprocess.run(["docker", "exec", "nginx-gateway", "nginx", "-t"], capture_output=True, text=True)
print(result.stdout, result.stderr)
if result.returncode:
    shutil.copy2(backup / config.name, config)
    if existed:
        subprocess.run(["docker", "cp", str(backup / limits.name), "nginx-gateway:/etc/nginx/conf.d/" + limits.name], check=True)
    else:
        subprocess.run(["docker", "exec", "nginx-gateway", "rm", "/etc/nginx/conf.d/" + limits.name], check=True)
    raise SystemExit("Validation failed; restored previous configuration")
subprocess.run(["docker", "exec", "nginx-gateway", "nginx", "-s", "reload"], check=True)
print("Hub delivery policy active. Backup:", backup)
