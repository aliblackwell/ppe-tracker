# EveryDoctor PPE Tracker

* [EveryDoctor website](https://www.everydoctor.org.uk/)
* [Public Trello board with project planning](https://trello.com/b/Ff9J6NA8/every-doctor-ppe-tracker)
* [Fundraising page by EveryDoctor](https://actionnetwork.org/fundraising/were-a-group-of-uk-doctors-building-a-coronavirus-research-platform-to-bring-the-facts-to-the-media/)

Hosted on Netlify: https://ppe-tracker.netlify.app

## Running the SMS mailshot

All the commands below can be copy and pasted but don't copy and paste the $ sign!

### 1 Open a terminal and navigate to your home directory:

`$ cd ~`

### 2 Clone the repository:

`$ git clone https://github.com/aliblackwell/ppe-tracker.git`

You will need to login to github on the command line. N.B. passwords don't appear as you type but just type it in and it will work.

### 3 Enter the folder that has been downloaded into your home directory:

This ensures our terminal is pointing at the right place and can see the package.json which contains the command we are about to run.

`$ cd ppe-tracker`

### 4 Install NPM dependencies:

This will pull down all the libraries the project makes use of.

`$ npm install`

### 5 Add environment variables

Open the project in a text editor and create a file called .env. Paste in the contents sent to you using the one-time sharing link and save the file. This file needs to sit next to .env.default

### 6 Run the script 

`$ npm run text-all`

This will run the script in scripts/text-all.js that looks in the database using the live username and password in your .env file and then connects to Twilio for each person and triggers a flow.

You can watch [the Twilio logs](https://www.twilio.com/console/studio/flows/FW29a06218204b8af552d00119ca02de35/executions) while it runs.