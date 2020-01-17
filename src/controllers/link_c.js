const ytdl = require('ytdl-core');
const linkManager = require('../utils/linkManager');

exports.add = async function (req, res) {
    res.render('link/add');
}

exports.checkAdd = async function (req, res) {
    let linkList = req.body.linkList;

    if (!Array.isArray(linkList)) return sendRes(res, 400, {
        msg: "The parameter is not an array"
    });

    linkList = linkList.filter(map => map);
    if (!linkList.length) return sendRes(res, 400, {
        msg: "There is no valid link"
    });

    const linkProms = linkList.map(map => linkManager.addLink(map));

    Promise.all(linkProms)
        .then(linkListRes => {
            linkListRes = linkListRes.filter(mapB => mapB);

            sendRes(res, 200, {
                msg: `${linkListRes.length}/${linkList.length} added links`
            });
        })
        .catch(err => {
            sendRes(res, 400, {
                msg: `Error: ${err}`
            });
        });
}

exports.list = async function (req, res) {
    const linkList = linkManager.getLinkList();
    const linkChunk = [];

    while (linkList.length > 0)
        linkChunk.push(linkList.splice(0, 3));

    if (linkChunk.length > 0) {
        const lastChunk = linkChunk[linkChunk.length - 1];

        while (lastChunk.length < 3)
            lastChunk.push({});
    }

    res.render('link/list', {
        cardDeck: linkChunk
    });
}

exports.download = async function (req, res) {

}

exports.remove = async function (req, res) {
    const videoId = req.body.videoId;
    if (!ytdl.validateID(videoId)) return sendRes(res, 400, {
        msg: "Invalid videoId"
    });

    linkManager.removeVid(videoId);

    sendRes(res, 200, {
        msg: "Video removed"
    });
}

function sendRes(res, code, content) {
    content.code = code;
    res.status(code).send(content);
}