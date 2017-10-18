// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

const request = require('reqeust')
const cheerio = require('cheerio')

const Logging = require('@google-cloud/logging');

// Instantiates a client
const logging = Logging();


// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


// exports.addMessage = functions.https.onRequest((req, res) => {
//
//
//     request.get('https://www.naver.com', (err, reponse, html) => {
//
//
//         const $ = cheerio.load(html)
//
//         let a = $('div.ah_list ul li')
//         let result = ""
//
//         a.each(function (i, e) {
//             var rank = $(e).children('a').children('span.ah_r').text()
//             var text = $(e).children('a').children('span.ah_k').text()
//
//             result = result.concat("<br>"+rank + '위 : ' +text+"<br>")
//         })
//         res.send(result)
//     })
//
// });
exports.helloError = functions.https.onRequest((request, response) => {
    // console.log('I am a log log!');
    // console.info('I am a log info!');
    // console.warn('I am a log warn!');
    // console.error('I am a log error!');
    // response.send('Hello World...');
    throw new Error('epic fail');
});

exports.errorFail = functions.https.onRequest((request, response) => {
    // This will NOT be reported to Stackdriver Error Reporting
    throw 1;
});


exports.reportError = functions.https.onRequest((request,res)=>{



    const httpRequest = httpRequest = {
        method: request.method,
        url: request.originalUrl,
        userAgent: request.get('user-agent'),
        referrer: '',
        remoteIp: request.ip
    };

    reportError({stack:"오류 보고"},{msg:"하울의 코딩 채널",httpRequest:httpRequest}).then(()=>{
        res.send("오류보고 완료")
    })
})

function reportError(err, context = {}) {
    // This is the name of the StackDriver log stream that will receive the log
    // entry. This name can be any valid log stream name, but must contain "err"
    // in order for the error to be picked up by StackDriver Error Reporting.
    const logName = 'errors';
    const log = logging.log(logName);

    // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
    const metadata = {
        resource: {
            type: 'cloud_function',
            labels: { function_name: process.env.FUNCTION_NAME }
        }
    };

    // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
    const errorEvent = {
        message: err.stack,
        serviceContext: {
            service: process.env.FUNCTION_NAME,
            resourceType: 'cloud_function'
        },
        context: context
    };

    // Write the error log entry
    return new Promise((resolve, reject) => {
        log.write(log.entry(metadata, errorEvent), error => {
            if (error) { reject(error); }
            resolve();
        });
    });
}
