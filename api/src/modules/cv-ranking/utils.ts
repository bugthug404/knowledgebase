export function generateUUID() {
  var chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return chars.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const fullQuery3 = `

System: strictly do not use markdown formating for the output. keep response presice & to the point. strictly follow output format example. strictly do not use new line characters in output. get candidate information from resume. Make sure to return valid JSON.

RatingScale: [
      {
        scoreRange: 91-100,
        description: "Candidate's resume showcases skills that perfectly align with the job description, including some additional directly relevant skills not mentioned. Their experience is highly relevant and directly applies to the job requirements."
      },
      {
        scoreRange: 81-90,
        description: "Candidate's resume demonstrates skills that mostly align with the job description. They possess transferable skills that could be adapted to the role. Their experience is highly relevant and directly applies to the job requirements."
      },
      {
        scoreRange: 71-80,
        description: "Candidate's resume highlights skills that partially align with the job description. They might have some directly relevant skills, but also some irrelevant ones. Their experience is somewhat relevant, but may require additional training for the specific job requirements."
      },
      {
        scoreRange: 61-70,
        description: "Candidate's resume showcases skills that have some overlap with the job description, but there are also significant gaps. Their experience is relevant in a different context, and may not directly translate to this role."
      },
      {
        scoreRange: 51-60,
        description: "A few of the candidate's skills or experience  don't directly match the job description. They might have some transferable skills, but may require significant upskilling or reskilling."
      },
      {
        scoreRange: 41-50,
        description: "Candidate's resume exhibits skills that mostly don't match the job description. While there might be some transferable skills, significant gaps exist. Their experience is not directly relevant and may require substantial adaptation for this role."
      },
      {
        scoreRange: 31-40,
        description: "Candidate's resume presents skills that are very different from the job description. They might have some relevant experience, but it's in a completely different field and may not be easily transferable."
      },
      {
        scoreRange: 21-30,
        description: "Candidate's resume showcases skills that have minimal alignment with the job description. They lack directly relevant skills and experience seems unrelated to the position's requirements."
      },
      {
        scoreRange: 11-20,
        description: "Candidate's resume offers very little that aligns with the job description. The skills and experience  presented  appear irrelevant to the role. Consider reviewing the resume format or if it's for the correct position."
      },
      {
        scoreRange: 1-10,
        description: "The resume appears invalid or incomplete, or the job description might be missing crucial information. It's difficult to assess the candidate's fit based on the provided documents. Consider requesting a revised resume or a more detailed job description."
      }      
    ]

    Generate Output Format Example: { "score":  "91" | "92" | "93" | "94" | "95" | "96" | "97" | "98" | "99" | "100", "candidateInfo": { "name": "John", "email": "john@example.com", "role": "Accountant", "phone": "+1234567890", "location": "New York, NY", }, "error": "cannot your process due to invalid candidates Resume or Job Description" | null }

    Generate response: Get RatingScale score as a output for user query, .
      
`;

1690;
const fullQuery = `
Query: How much is Resume suitable according to the RatingScale.

    RatingScale: [
      {
        scoreRange: 91-100,
        description: "Candidate's resume showcases skills that perfectly align with the job description, including some additional directly relevant skills not mentioned. Their experience is highly relevant and directly applies to the job requirements."
      },
      {
        scoreRange: 81-90,
        description: "Candidate's resume demonstrates skills that mostly align with the job description. They possess transferable skills that could be adapted to the role. Their experience is highly relevant and directly applies to the job requirements."
      },
      {
        scoreRange: 71-80,
        description: "Candidate's resume highlights skills that partially align with the job description. They might have some directly relevant skills, but also some irrelevant ones. Their experience is somewhat relevant, but may require additional training for the specific job requirements."
      },
      {
        scoreRange: 61-70,
        description: "Candidate's resume showcases skills that have some overlap with the job description, but there are also significant gaps. Their experience is relevant in a different context, and may not directly translate to this role."
      },
      {
        scoreRange: 51-60,
        description: "A few of the candidate's skills or experience  don't directly match the job description. They might have some transferable skills, but may require significant upskilling or reskilling."
      },
      {
        scoreRange: 41-50,
        description: "Candidate's resume exhibits skills that mostly don't match the job description. While there might be some transferable skills, significant gaps exist. Their experience is not directly relevant and may require substantial adaptation for this role."
      },
      {
        scoreRange: 31-40,
        description: "Candidate's resume presents skills that are very different from the job description. They might have some relevant experience, but it's in a completely different field and may not be easily transferable."
      },
      {
        scoreRange: 21-30,
        description: "Candidate's resume showcases skills that have minimal alignment with the job description. They lack directly relevant skills and experience seems unrelated to the position's requirements."
      },
      {
        scoreRange: 11-20,
        description: "Candidate's resume offers very little that aligns with the job description. The skills and experience  presented  appear irrelevant to the role. Consider reviewing the resume format or if it's for the correct position."
      },
      {
        scoreRange: 1-10,
        description: "The resume appears invalid or incomplete, or the job description might be missing crucial information. It's difficult to assess the candidate's fit based on the provided documents. Consider requesting a revised resume or a more detailed job description."
      }      
    ]
    
    Job Description: Job description Please read the Job description carefully and respond to all the questions. Failure to do so will automatically reject your application. The Role: Weblianz is hiring a skilled MERN Stack Developer. Requirements: · Must have at least 1+ years. relevant experience in MERN Stack development. · Backend development experience in NodeJS. Experience in writing Node JS Backend APIs and Microservices · Database experience in MongoDB, Mysql, MariaDB, PostgreSQL, Sequelize or similar ORM's. · Frontend development experience in React, Next.js · Experience in React Native is an added advantage · Good knowledge of Javascript, CSS ,SASS/ LESS, TailwindCSS, Bootstrap · Excellent communication in written and spoken English. · Self Starter and should be able to work independently with minimal supervision. Job Type: Full-time Pay: ₹120,000.00 - ₹360,000.00 per year Benefits: Work from home Schedule: Day shift Monday to Friday Tipe Lokasi: Remote Application Question(s): What is your current CTC ? What is your expected CTC ? What is your notice period ? Share your linkedin profile link Experience: Node.js: 1 year (Required) React: 1 year (Required) MySQL: 1 year (Required) total: 1 year (Required) MongoDB: 1 year (Required) Work Location: Remote

    Resume: Harsh Kumar FULL STACK DEVELOPER +(91) 9102768539 harshverma0362@gmail.com linkedin.com/in/harshverma036 harshverma036 Skills Backend: NodeJS, MongoDB, PostgreSQL, SQL, Redis, Prisma, Django. Frontend: ReactJS, NextJS, Redux, Tailwind, Bootstrap, HTML, CSS, Ant design, Shadcn. Languages: Javascript, Typescript, Python, C, C++, R. Other tools and technologies: OpenAI, AssemblyAI, Linux, RabbitMQ, Bull, GitHub, Git, Gitlab. Experience One Percent Startups – Full Stack Developer [Typescript, Nestjs, Nextjs, Reactjs, PostgreSQL, SQL, MongoDB, Linux, Bull, RabbitMQ, Prisma] ➢ Developed a platform similar to ZOHO inventory to manage inventory, invoicing, taxation, sales order, purchase order and more. ➢ Developed a platform the completely handle doctor/therapist appointment booking system with opd, enrolment, automations, role-based system. Per day 1000+ appointments and session booked. ➢ Developed a scheduler that is used to schedule movies in auditoriums of cinemas at different location in automated way. Currently used by Cinepolis India. February 2023 – Present Indian Institute of digital Education – Full Stack Developer [Typescript, Nodejs, Reactjs, PostgreSQL, SQL, MongoDB, Linux, Cron, Prisma] ➢ Developed and optimized the working of Learning Management System used by 5000+ students and teachers. ➢ Developed a platform to generate certificates of every course of the company and let user can share and validate with unique ids on social media. May 2021 – February 2023 DataPhilics – Full Stack Developer [Typescript, Reactjs, PostgreSQL, MongoDB, Linux, Prisma] ➢ Developed POS for hotels and restaurants. ➢ Developed mobile first food ordering web application. ➢ Developed backend APIs for menu, staff and customer management. January 2021 – April 2021 Projects EnSight – [Open] [Nestjs, Reactjs, Tailwindcss, Prisma, OpenAI, AssemblyAI, Bull, Queuing] ➢ Combines AssemblyAI for audio transcription and GPT-4 for summarization, allowing users to select customized formats for easier comprehension ➢ Integrates GPT-4 APIs, enabling users to engage in chat-based Q&A sessions, leveraging summarized content for deeper understanding. January 2024 – February 2024 Education BACHELOR OF TECHNOLOGY 7.6 CGPA May 2021 – August 2025 Chandigarh Engineering College HIGHER SECONDARY EDUCATION April 2018 – May 2020 Gayanda International School

    Generate Output Format Example: {
      score: 95,
      candidateInfo: {
        name: "John",
        email: "john@example.com",
        role: "Accountant",
        phone: "+1234567890",
        location: "New York, NY",
      },
      error: "cannot your process due to invalid candidates Resume or Job Description" | null,
    }

    System: do not use markdown formating for the output. keep response presice & to the point. strictly follow output format. do not use new line characters for output. get candidate information from resume. Make sure to return valid JSON.

    Generate response: Get RatingScale score as a output for user query.
`;

883;
const query = `
Query: How much is Resume suitable according to the RatingScale.

    Job Description: Job description Please read the Job description carefully and respond to all the questions. Failure to do so will automatically reject your application. The Role: Weblianz is hiring a skilled MERN Stack Developer. Requirements: · Must have at least 1+ years. relevant experience in MERN Stack development. · Backend development experience in NodeJS. Experience in writing Node JS Backend APIs and Microservices · Database experience in MongoDB, Mysql, MariaDB, PostgreSQL, Sequelize or similar ORM's. · Frontend development experience in React, Next.js · Experience in React Native is an added advantage · Good knowledge of Javascript, CSS ,SASS/ LESS, TailwindCSS, Bootstrap · Excellent communication in written and spoken English. · Self Starter and should be able to work independently with minimal supervision. Job Type: Full-time Pay: ₹120,000.00 - ₹360,000.00 per year Benefits: Work from home Schedule: Day shift Monday to Friday Tipe Lokasi: Remote Application Question(s): What is your current CTC ? What is your expected CTC ? What is your notice period ? Share your linkedin profile link Experience: Node.js: 1 year (Required) React: 1 year (Required) MySQL: 1 year (Required) total: 1 year (Required) MongoDB: 1 year (Required) Work Location: Remote

    Resume: Harsh Kumar FULL STACK DEVELOPER +(91) 9102768539 harshverma0362@gmail.com linkedin.com/in/harshverma036 harshverma036 Skills Backend: NodeJS, MongoDB, PostgreSQL, SQL, Redis, Prisma, Django. Frontend: ReactJS, NextJS, Redux, Tailwind, Bootstrap, HTML, CSS, Ant design, Shadcn. Languages: Javascript, Typescript, Python, C, C++, R. Other tools and technologies: OpenAI, AssemblyAI, Linux, RabbitMQ, Bull, GitHub, Git, Gitlab. Experience One Percent Startups – Full Stack Developer [Typescript, Nestjs, Nextjs, Reactjs, PostgreSQL, SQL, MongoDB, Linux, Bull, RabbitMQ, Prisma] ➢ Developed a platform similar to ZOHO inventory to manage inventory, invoicing, taxation, sales order, purchase order and more. ➢ Developed a platform the completely handle doctor/therapist appointment booking system with opd, enrolment, automations, role-based system. Per day 1000+ appointments and session booked. ➢ Developed a scheduler that is used to schedule movies in auditoriums of cinemas at different location in automated way. Currently used by Cinepolis India. February 2023 – Present Indian Institute of digital Education – Full Stack Developer [Typescript, Nodejs, Reactjs, PostgreSQL, SQL, MongoDB, Linux, Cron, Prisma] ➢ Developed and optimized the working of Learning Management System used by 5000+ students and teachers. ➢ Developed a platform to generate certificates of every course of the company and let user can share and validate with unique ids on social media. May 2021 – February 2023 DataPhilics – Full Stack Developer [Typescript, Reactjs, PostgreSQL, MongoDB, Linux, Prisma] ➢ Developed POS for hotels and restaurants. ➢ Developed mobile first food ordering web application. ➢ Developed backend APIs for menu, staff and customer management. January 2021 – April 2021 Projects EnSight – [Open] [Nestjs, Reactjs, Tailwindcss, Prisma, OpenAI, AssemblyAI, Bull, Queuing] ➢ Combines AssemblyAI for audio transcription and GPT-4 for summarization, allowing users to select customized formats for easier comprehension ➢ Integrates GPT-4 APIs, enabling users to engage in chat-based Q&A sessions, leveraging summarized content for deeper understanding. January 2024 – February 2024 Education BACHELOR OF TECHNOLOGY 7.6 CGPA May 2021 – August 2025 Chandigarh Engineering College HIGHER SECONDARY EDUCATION April 2018 – May 2020 Gayanda International School
`;

801;
const SystemPropmtOnly = `
System: do not use markdown formating for the output. keep response presice & to the point. strictly follow output format. do not use new line characters for output. get candidate information from resume. Make sure to return valid JSON.

RatingScale: [
      {
        scoreRange: 91-100,
        description: "Candidate's resume showcases skills that perfectly align with the job description, including some additional directly relevant skills not mentioned. Their experience is highly relevant and directly applies to the job requirements."
      },
      {
        scoreRange: 81-90,
        description: "Candidate's resume demonstrates skills that mostly align with the job description. They possess transferable skills that could be adapted to the role. Their experience is highly relevant and directly applies to the job requirements."
      },
      {
        scoreRange: 71-80,
        description: "Candidate's resume highlights skills that partially align with the job description. They might have some directly relevant skills, but also some irrelevant ones. Their experience is somewhat relevant, but may require additional training for the specific job requirements."
      },
      {
        scoreRange: 61-70,
        description: "Candidate's resume showcases skills that have some overlap with the job description, but there are also significant gaps. Their experience is relevant in a different context, and may not directly translate to this role."
      },
      {
        scoreRange: 51-60,
        description: "A few of the candidate's skills or experience  don't directly match the job description. They might have some transferable skills, but may require significant upskilling or reskilling."
      },
      {
        scoreRange: 41-50,
        description: "Candidate's resume exhibits skills that mostly don't match the job description. While there might be some transferable skills, significant gaps exist. Their experience is not directly relevant and may require substantial adaptation for this role."
      },
      {
        scoreRange: 31-40,
        description: "Candidate's resume presents skills that are very different from the job description. They might have some relevant experience, but it's in a completely different field and may not be easily transferable."
      },
      {
        scoreRange: 21-30,
        description: "Candidate's resume showcases skills that have minimal alignment with the job description. They lack directly relevant skills and experience seems unrelated to the position's requirements."
      },
      {
        scoreRange: 11-20,
        description: "Candidate's resume offers very little that aligns with the job description. The skills and experience  presented  appear irrelevant to the role. Consider reviewing the resume format or if it's for the correct position."
      },
      {
        scoreRange: 1-10,
        description: "The resume appears invalid or incomplete, or the job description might be missing crucial information. It's difficult to assess the candidate's fit based on the provided documents. Consider requesting a revised resume or a more detailed job description."
      }      
    ]

    Generate Output Format Example: {
      score: 95,
      candidateInfo: {
        name: "John",
        email: "john@example.com",
        role: "Accountant",
        phone: "+1234567890",
        location: "New York, NY",
      },
      error: "cannot your process due to invalid candidates Resume or Job Description" | null,
    }


    Generate response: Get RatingScale score as a output for user query.
`;
