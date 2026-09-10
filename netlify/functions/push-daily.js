const daily = require("../../api/push/daily.js");

function mockRes() {
  return {
    statusCode: 200,
    body: "",
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = JSON.stringify(payload);
      this.headers["Content-Type"] = "application/json";
    },
    end() {},
  };
}

exports.handler = async (event) => {
  const req = { method: event.httpMethod, body: {} };
  const res = mockRes();
  await daily(req, res);
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body || JSON.stringify({ ok: true }),
  };
};
