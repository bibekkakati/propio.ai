const morgan = require("morgan");

module.exports = () =>
    morgan((tokens, req, res) => {
        return [
            `[${tokens.method(req, res)}]`,
            res.statusCode >= 400
                ? tokens.status(req, res)
                : tokens.status(req, res),
            tokens.url(req, res),
            "-",
            tokens["response-time"](req, res) + " ms",
            "@ " + tokens.date(req, res),
            req.headers.origin,
            tokens["user-agent"](req, res),
            req.user ? req.user.userId : "",
        ].join(" ");
    });
