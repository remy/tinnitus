Notched Therapy for Tinnitus
============================

I'm a long time sufferer of tinnitus - even as I write this it rings away in my head. I found [research](http://www.ncbi.nlm.nih.gov/pmc/articles/PMC2918775/pdf/cib0303_0274.pdf) performed in the last few years that tells of a study performed with tinnitus sufferers and "notched music therapy". 

Often the sites that would help create notched music required some payment (that I personally didn't find was justified). Notched music can also be created using Audacity, but I knew with the new WebAudio API it could be done in the browser. So this is my attempt.

## Project Status

Currently the project is just a bit of the client side, which I've hosted, or you can try out on using a [5minfork](http://5minfork.com/remy/tinnitus/) of this repo (make sure to navigate to public directory).

However, I do intend to flesh out the server side so the app can **freely provide**:

- Match and find the pitch of your tinnitus ✔
- Play white noise with your pitch notched out ✔
- Upload (via drag and drop) your own mp3 files and notch ✔
- Recording of tinnitus pitch over time
- Export white noise as wav (done in client side)
- Export white noise as mp3 (done using round trip to server)
- Upload a zip file of mp3 files to notch
- Export (as a zip or individual files) of notched mp3 files (also requires trip to server)

*More details to come as I continue to develop this.*
