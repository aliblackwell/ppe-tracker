# EveryDoctor PPE Tracker

* [EveryDoctor website](https://www.everydoctor.org.uk/)
* [Public Trello board with project planning](https://trello.com/b/Ff9J6NA8/every-doctor-ppe-tracker)
* [Fundraising page by EveryDoctor](https://actionnetwork.org/fundraising/were-a-group-of-uk-doctors-building-a-coronavirus-research-platform-to-bring-the-facts-to-the-media/)

Hosted on Netlify: https://ppe-tracker.netlify.app

## Running the SMS mailshot

1. Open a terminal and navigate to your home directory:

`$ cd ~`

2. Clone the repository:

`$ git clone https://github.com/aliblackwell/ppe-tracker.git`

You will need to login to github on the command line.

3. Enter the folder that has been downloaded into your home directory:

`$ cd ppe-tracker`

4. Install NPM dependencies:

`$ npm install`

5. Open the project in a text editor and create a file called .env. Paste in the contents sent to you using the one-time sharing link and save the file. This file needs to sit next to .env.default

6. Run the script in scripts/text-all.js by running the following command:

`$ npm run text-all`

