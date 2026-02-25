import { motion } from 'framer-motion';

export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <section className="pt-32 pb-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
            <span className="text-gradient">Privacy Policy</span>
          </h1>
          <p className="text-[var(--color-mist)] text-center mb-12">
            Last modified July 8, 2024
          </p>

          <div className="prose-legal space-y-6 text-[var(--color-mist)] leading-relaxed">
            <div className="glass rounded-2xl p-6 mb-8">
              <p className="font-bold text-[var(--color-pearl)] m-0">
                PLEASE REVIEW THIS POLICY CAREFULLY
              </p>
            </div>

            <p>
              The following describes how Toremy LLC ("Toremy," "we," "us" or "our") uses and disseminates
              information you provide through{' '}
              <a href="https://www.one-stop-adjuster.com/" className="text-[var(--color-gold)] hover:underline">
                https://www.one-stop-adjuster.com/
              </a>{' '}
              and its sub-domains and affiliated sites, as well as Toremy LLC pages and accounts on Twitter,
              Facebook, LinkedIn, Instagram, TikTok, and YouTube (the "Sites"). If you ever have questions
              about this Privacy Policy, please contact us using the information below. Please also review our
              full Terms and Conditions of Use, which also govern your use of the Sites. By using this Site,
              you are consenting to this Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              COLLECTION OF YOUR PERSONAL INFORMATION
            </h2>
            <p>
              Unless I expressly note otherwise, I do not collect personally identifiable information from users
              of our Sites. When you visit our Sites, some information about your computer hardware and software
              is inherently automatically collected, such as your IP address, domain name, browser type, access
              time and referring website addresses. I typically do not use this information for any purpose, but
              an example of when I may use this information is in implementing improvements and analyzing the
              Sites and for troubleshooting purposes. I also utilize this information to monitor and improve
              services and to ensure that your use of the Sites is in compliance with Terms of Use.
            </p>
            <p>
              Most of our services do not require any form of registration, allowing you to visit the Sites
              without telling us who you are. However, some services, such as email opt-ins may require you to
              provide us with Personal Data. In such a case, you may choose to withhold any Personal Data
              requested by us, but it may not be possible for you to gain access to certain parts of the site
              or content. We require only the information that is reasonably required to enter into a contract
              with you. We will not require you to provide consent for any unnecessary processing as a condition
              of entering into a contract with us.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              INTERNATIONAL PRIVACY LAWS AND YOUR RIGHTS UNDER THE GDPR
            </h2>
            <p>
              If you are visiting the Site from outside the United States, please be aware that you are sending
              information to the United States where our servers are located. Information you submit may then be
              transferred within the United States or back out of the United States to other countries outside
              of your country of residence, depending on the type of information and how it is stored by us.
              These countries (including the United States) may not necessarily have data protection laws as
              comprehensively protective as your country of residence; however, our collection, storage, and
              use of your data will at all times continue to be governed by this Privacy Policy.
            </p>
            <p>
              If you are a member of the European Union (EU), you have special rights under the GDPR. Those include:
              You have the right to object to the processing of your data and the right to portability of your data.
              All complaints must be sent to your support email address or email address of your GDPR representative
              or data processor. You also have the right to erasure, rectification, access, or to seek restrictions
              to the processing of your personal data in our system. To the extent you provide consent to our
              processing of your personal data, you have the right to withdraw that consent at any time. Any
              withdrawal of consent does not apply to data collected lawfully prior to such consent. You have
              the right to lodge a complaint with a supervisory authority containing jurisdiction over GDPR
              related issues.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              COOKIES: WHAT THEY ARE, AND WHY THEY ARE NEEDED
            </h2>
            <p>
              A cookie is a data text file sent from a website to your browser, for the purpose of identifying
              the user and allows access to portions of the website, thus alleviating the need to continually
              log in with your username and password. Cookies may be stored within your system. To the extent
              I use cookies, I can only access information from a cookie sent by one of the Sites, not other
              websites. I may use cookies to personalize your visit to our Sites because tracking usage allows
              us to best determine the needs of our customers and advertisers.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              POLICY WITH MINORS
            </h2>
            <p>
              Our sites are not intended for individuals under the age of 18. If you are under 18, you may only
              use the Sites under the supervision of a parent or guardian. We do not collect or maintain
              information from anyone known to be under the age of 18, and no part of this website is designed
              to attract anyone under the age of 18. We do not sell products or services intended for purchase
              by children. If we discover or are otherwise notified that we have received any such information
              from a child in violation of this policy, we will delete that information.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              DATA RETENTION
            </h2>
            <p>
              We only retain Personal Data collected from Users for as long as the User's account is active or
              otherwise for a limited period of time as long as we need it to fulfill the purposes for which we
              have initially collected it unless otherwise required by law. We will retain and use information
              as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements
              for a period of 10 years.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              USE OF YOUR PERSONAL INFORMATION
            </h2>
            <p>
              If you do choose to provide your personal information, we will not willingly share your information
              with companies outside our organization, except as described in this Privacy Policy. You may at
              times receive communications from us related to products and services that we believe might interest
              you. While we believe these services may enhance your time spent at the Sites, you will at all times
              have the option and ability to opt out from receiving these communications by specifically choosing
              to do so via a link which will be provided within emails that we send to you. We may disclose total
              aggregated user statistics in order to describe our services to potential advertisers, other third
              parties, affiliate companies, and for other lawful purposes.
            </p>
            <p>
              The information we gather from you may be used in several ways, either now or in the future, to
              gain a better understanding of our Sites' users and their usage pattern as a whole, for site
              administration and troubleshooting, to process transactions, contest entries and other matters
              you initiate, to identify preferences in content and advertising, to target editorial, advertising
              or other content (such as promotions, special offers or other content) we think might be of interest
              to you. We may also use information we gather from you to communicate changes and improvements to
              our website or any registration you have made.
            </p>
            <p>
              You have the right to request access to the information we have for you. You can do this by
              contacting us at your support email. We will respond within 30 calendar days from the day the
              request is received. If there are extenuating circumstances preventing the fulfillment of your
              request, we reserve the right to reasonably extend our response due date, if reasonably necessary,
              and will notify you of such extension by mail/electronically. We will make sure to provide you
              with a copy of the data we process about you. In order to comply with your request, we may ask
              you to verify your identity. We will fulfill your request by sending your copy electronically
              unless the request specifies a different method. If you believe that the information we have
              about it is incorrect, or if you wish to remove your private information (such as an email
              address provided in an opt-in), you may contact us at your support email. Any data that is no
              longer needed for the purposes specified herein will be deleted.
            </p>
            <p>
              We do not give away, sell, rent or lease any users' personally identifiable information to any
              merchant, advertiser or web publisher. However, non-personally identifiable user information
              (such as usage pattern, browser type, and your computer) may be shared with third party businesses
              or advertisers with which we have a business or contractual relationship. We reserve the right to
              disclose personal information when needed to comply with the law or a legal process, cooperate
              with investigations of purported unlawful activities, to identify persons violating the law, in
              connection with the sale of part or all of Toremy LLC's or its affiliates' assets, or to enforce
              our Terms of Use.
            </p>
            <p>
              Please keep in mind that if you disclose personally identifiable information in a public manner
              through the Sites, this information may be collected and used by others accessing those portions
              of the Sites. I do not monitor information you disclose on the Sites nor do I accept any liability
              associated with your voluntary disclosure of the same.
            </p>
            <p>
              You are responsible for reviewing the privacy statements and policies of other websites you choose
              to link to or from the Sites, so that you may understand how those sites collect, use and store
              your information. I am not responsible for the privacy statements, policies or content of any
              other websites. Websites containing co-branding (referencing our name and a third party's name)
              contain content delivered by the third party and not me.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              LIMITATIONS
            </h2>
            <p>
              By using the Sites you agree that we are not responsible for: (i) any disclosure of your personal
              information made by you to a third party through your use of the Sites; (ii) any disclosure of
              your personal information obtained illegally from us; or (iii) any accidental disclosure of your
              personal information made by us.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              POLICY CHANGES
            </h2>
            <p>
              We may modify this Privacy Policy from time to time. Any modifications will be effective immediately
              when we post them. We will take steps to notify users of any modifications, however, you are
              responsible for reviewing any modified terms. When we update our Policy, we will note the date of
              revisions at the top of the Policy. Your continued use of a Site following any changes means you
              accept and agree to any changes. For your convenience and future reference, the date of the Privacy
              Policy is included so that you can compare any different versions of the Privacy Policy to determine
              any changes made to the Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              YOUR COMMENTS AND CONCERNS
            </h2>
            <p>
              This website is operated by Toremy LLC, 9311 D'Olive Road, Spanish Fort, AL. 36527. All other
              feedback, comments, requests for technical support and other communications relating to the Sites
              should be directed to{' '}
              <a href="mailto:support@one-stop-adjuster.com" className="text-[var(--color-gold)] hover:underline">
                support@one-stop-adjuster.com
              </a>.
            </p>

            {/* CCPA Section */}
            <div className="border-t border-[var(--color-wave)] mt-16 pt-12">
              <h2 className="text-3xl font-bold text-[var(--color-foam)] mb-2">
                Notice under California Consumer Privacy Act
              </h2>
              <p className="text-[var(--color-mist)] mb-8">
                Last modified July 8, 2024
              </p>

              <p>
                This Privacy Notice explains, in general, the procedures behind our collection, storage, and
                process of the information we may collect from you online, if any. This notice is intended to
                operate as a supplement to our Privacy Policy, for the sole purpose of defining rights that
                California consumers may have with respect to our Sites under the California Consumer Privacy
                Act of 2018 ("CCPA").
              </p>
              <p>
                Terms such as "personal information" and "processing" that are defined in the CCPA will have
                the same definitions in this Notice as we understand them to have under the CCPA. This includes
                exceptions to certain terms under the CCPA. For example, "personal information" under the CCPA
                does not include publicly available, aggregate consumer information, or de-identified information.
              </p>
              <p>
                The following chart is for the sole purpose of demonstrating the categories of information we
                may collect online, and other relevant information, such as why we collect information, how it
                is shared, if it is shared, and whether we sell that personal information.
              </p>

              <h3 className="text-xl font-bold text-[var(--color-foam)] mt-8 mb-4">
                Personal Information
              </h3>

              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-[var(--color-wave)] rounded-lg overflow-hidden text-sm">
                  <thead className="bg-[var(--color-ocean)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[var(--color-pearl)] font-bold">Type of Information Collected</th>
                      <th className="px-4 py-3 text-left text-[var(--color-pearl)] font-bold">Purpose for Collection</th>
                      <th className="px-4 py-3 text-left text-[var(--color-pearl)] font-bold">Who do we share Information with?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--color-wave)]">
                      <td className="px-4 py-3">
                        Name, email address, phone number, referral information
                      </td>
                      <td className="px-4 py-3">
                        Information requested on our contact page, located at{' '}
                        <a href="https://www.one-stop-adjuster.com/" className="text-[var(--color-gold)] hover:underline">
                          https://www.one-stop-adjuster.com/
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        Third party service providers as necessary to administer, facilitate, and enhance the
                        provision of our Sites under agreements that such providers maintain the information
                        confidential.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        Information available through your Internet Protocol address
                      </td>
                      <td className="px-4 py-3">
                        Collected automatically through various website tools we employ, as defined in our
                        Cookie Notice. Collection of such information aids in improving our website for our
                        visitors.
                      </td>
                      <td className="px-4 py-3">
                        Third party service providers as necessary to administer, facilitate, and enhance the
                        provision of our Sites under agreements that such providers maintain the information
                        confidential.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                If you would like to request additional information, please email{' '}
                <a href="mailto:support@one-stop-adjuster.com" className="text-[var(--color-gold)] hover:underline">
                  support@one-stop-adjuster.com
                </a>, and complete the following:
              </p>
              <ul className="list-disc list-inside ml-4 my-4">
                <li>Identify yourself</li>
                <li>Specify the information you request to be accessed, corrected, or removed</li>
              </ul>

              <p>
                Please note that we reserve the right to request additional information to verify the above,
                including a form of government-issued identification. We additionally reserve the right to
                decline to process requests if you fail to provide either of the above, if we believe the
                request will violate any other law or legal requirement, cause the information to be incorrect,
                or jeopardize the privacy of others.
              </p>
              <p>
                Written responses to information requested under this section will be delivered by mail/electronically.
                We will respond within 30 calendar days from the day the request is received. If there are
                extenuating circumstances preventing the fulfillment of your request, we reserve the right to
                extend our response due date, if reasonably necessary, and will notify you of such extension by
                mail/electronically. If a request is declined, we will provide an explanation as to why. You
                have the right to appeal a denial. We will not discriminate against you for exercising any
                rights available to you under applicable law.
              </p>
              <p>
                We additionally reserve the right to modify or delete some or all of your information collected.
                In such a case, we will retain data as reasonably necessary to comply with any legal obligations,
                including regulatory, security, or dispute requirements, law enforcement requirements, to prevent
                fraud or abuse, or to enforce obligations, including any other requests from you.
              </p>
              <p>
                To make a request, you're welcome to contact us at the information provided in our Privacy Policy.
                You can designate an agent to make a request on your behalf in one of two ways: (1) having your
                agent send us a letter, signed by you, certifying that the agent is acting on your behalf and
                showing proof that they are registered with the California Secretary of State; or (2) by you and
                the agent executing and sending us a notarized power of attorney stating that the agent is
                authorized to act on your behalf. Please note that we may still require you to verify your
                identity before we process a request submitted by your agent.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
