# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import threading

# 腾讯云SDK
from tencentcloud.common import credential
from tencentcloud.common.profile.client_profile import ClientProfile
from tencentcloud.common.profile.http_profile import HttpProfile
from tencentcloud.ai3d.v20250513 import ai3d_client, models

app = Flask(__name__)
CORS(app)

# ====================== 你的密钥 ======================
SecretId = "这里填你的SecretId"
SecretKey = "这里填你的SecretKey"
# ======================================================

tasks = {}

# --------------------------
# 生成模型接口
# --------------------------
@app.route("/api/generate", methods=["POST"])
def api_generate():
    try:
        data = request.json
        prompt = data.get("description", "一个小盒子")
        task_id = f"task_{int(time.time())}"
        tasks[task_id] = {"status": "生成中", "stl_url": ""}

        threading.Thread(target=run_tencent_3d, args=(task_id, prompt)).start()

        return jsonify({
            "success": True,
            "taskId": task_id,
            "modelUrl": ""
        })
    except Exception as e:
        return jsonify({"success": False, "msg": str(e)})

# --------------------------
# 调用腾讯混元3D
# --------------------------
def run_tencent_3d(task_id, prompt):
    try:
        cred = credential.Credential(SecretId, SecretKey)
        httpProfile = HttpProfile()
        httpProfile.endpoint = "ai3d.tencentcloudapi.com"
        clientProfile = ClientProfile()
        clientProfile.httpProfile = httpProfile
        client = ai3d_client.Ai3dClient(cred, "ap-guangzhou", clientProfile)

        req = models.SubmitHunyuanTo3DProJobRequest()
        params = {
            "Prompt": prompt,
            "ResultFormat": "STL"
        }
        req.from_json_string(json.dumps(params))
        resp = client.SubmitHunyuanTo3DProJob(req)
        job_id = resp.JobId

        while True:
            query_req = models.QueryHunyuanTo3DProJobRequest()
            query_req.from_json_string(json.dumps({"JobId": job_id}))
            query_resp = client.QueryHunyuanTo3DProJob(query_req)
            status = query_resp.Status

            if status == "DONE":
                for f in query_resp.ResultFile3Ds:
                    if f.Type == "STL":
                        tasks[task_id]["stl_url"] = f.Url
                        tasks[task_id]["status"] = "生成完成"
                break
            elif status in ["FAIL", "ERROR"]:
                tasks[task_id]["status"] = "生成失败"
                break
            time.sleep(2)

    except Exception as e:
        tasks[task_id]["status"] = f"错误：{str(e)}"

# --------------------------
# 提交任务接口
# --------------------------
@app.route("/api/submit", methods=["POST"])
def api_submit():
    return jsonify({"success": True, "msg": "任务已提交"})

# --------------------------
# 查询状态接口（替代WebSocket，不报错）
# --------------------------
@app.route("/api/status/<task_id>", methods=["GET"])
def api_status(task_id):
    if task_id in tasks:
        return jsonify(tasks[task_id])
    return jsonify({"status": "不存在"})

# --------------------------
# 启动服务
# --------------------------
if __name__ == "__main__":
    app.run(host="localhost", port=8080, debug=True)