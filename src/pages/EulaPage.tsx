import { motion } from 'framer-motion';

export default function EulaPage(): React.JSX.Element {
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
            <span className="text-gradient">Mobile Application End User Agreement</span>
          </h1>
          <p className="text-[var(--color-mist)] text-center mb-12">
            One Stop Adjuster (OSA) Mobile Application
          </p>

          <div className="prose-legal space-y-6 text-[var(--color-mist)] leading-relaxed">
            <p>
              This Mobile Application End User Agreement ("Agreement") is a binding agreement between
              ("you") and Toremy LLC. You are agreeing to this Agreement not as an individual but on behalf
              of your company, government, or other entity for which you are acting (for example, as an
              employee or governmental official), "you, your" means your entity and you are binding your
              entity to this Agreement. This Agreement governs your use of the One Stop Adjuster (OSA)
              mobile application for Apple iOS or Google Android operating systems (including all related
              documentation, the "Application"). Toremy LLC may modify this Agreement from time to time,
              subject to the terms of this Agreement.
            </p>

            <p>
              The "Effective Date" of this Agreement is the date which is the date in which both parties have
              signed the Agreement.
            </p>

            <p className="font-semibold text-[var(--color-pearl)]">By signing this agreement, you:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>(a) acknowledge that you have read and understand this agreement;</li>
              <li>(b) signify that you are of a legal age to enter into a legal and binding agreement;</li>
              <li>
                (c) acknowledge and agree that this Agreement constitutes the entire agreement
                between the parties with respect to the subject matter of this Agreement and replaces
                and supersedes all prior or agreements, representations, understandings, and
                communications, whether oral or written, between Toremy LLC and you; and
              </li>
              <li>(d) accept this agreement and agree that you are legally bound by its:</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              1. License Grant
            </h2>
            <p>
              Subject to the terms of this Agreement, Toremy LLC grants you a limited, non-exclusive,
              non-sublicensable and nontransferable license to send and receive Data transmitted
              between OSA and you via an electronic data interchange bridge.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              2. License Restrictions
            </h2>
            <p>Licensee shall not:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>(a) copy the Application, except as expressly permitted by this Agreement;</li>
              <li>
                (b) modify, translate, adapt, or otherwise create derivative works or improvements,
                whether or not patentable, of the Application;
              </li>
              <li>
                (c) reverse engineer, disassemble, decompile, decode or otherwise attempt to derive or
                gain access to the source code of the Application or any part thereof;
              </li>
              <li>
                (d) remove, delete, alter, or obscure any trademarks or any copyright trademark, patent
                or other intellectual property or proprietary rights notices from the Application,
                including any copy thereof;
              </li>
              <li>
                (e) rent, lease, lend, sell, sublicense, assign, distribute, publish, transfer or otherwise
                make available the Application or any features or functionality of the Application, to any
                third party for any reason, including by making the Application available on a network
                where it is capable of being accessed by more than one device at any time with the
                exception of your own employees and independent contractors; or
              </li>
              <li>
                (f) remove, disable, circumvent, or otherwise create or implement any workaround to
                any copy protection, rights management, or security features in or protecting the
                Application.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              3. Reservation of Rights
            </h2>
            <p>
              You acknowledge and agree that the Application is made available for use, it is licensed and
              not sold to you. You acknowledge and agree that this Agreement does not transfer to you any
              Toremy LLC or third-party intellectual property rights. Toremy LLC and its licensors and service
              providers reserve and retain their entire right, title, and interest in the Application, including
              all copyrights, trademarks, and other intellectual property rights or relating to, except as
              expressly granted to you in this Agreement.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              4. Collection and Use of Your Information
            </h2>
            <p>
              You acknowledge that when you install, download, or use the Application, Toremy LLC may use
              automated means (including but not limited to, cookies and web beacons) to collect information
              about your computer system or mobile device and about your use of the Application. You may
              also be required to provide information about yourself as a condition of installing, downloading,
              or using the Application or any of its features or functionality, and the Application may provide
              you with opportunities to share information about yourself with others. All information we
              collect through or in connection with this Application is subject to our Privacy Policy. By
              installing, downloading, using, and providing information to or through this Application, you
              consent to all actions taken by us with respect to your information in compliance with the
              Privacy Policy.
            </p>
            <p className="ml-4">
              (a) Toremy LLC does not store any information that is inputted into the Application or
              transmitted to or from your computer systems or mobile devices. You acknowledge that
              you are solely responsible for any and all information input into the Application whether
              transmitted or not.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              5. Open-Source Software
            </h2>
            <p>
              Any part of the Application that utilizes or contains Open-Source Software is made available
              under the terms of the open-source license agreements referenced in the applicable distribution
              or the applicable help, notices, about or source files or documentation. Copyrights and other
              proprietary rights to the Open-Source Software are held by the copyright holders identified in
              the applicable distribution or the applicable help, notices, about or source files or Documentation.
              Toremy LLC shall not include any code licensed under and "viral" or "copyleft" license.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              6. Updates
            </h2>
            <p>
              Toremy LLC may from time to time in its sole discretion develop and provide Application updates,
              which may include upgrades, bug fixes, patches or other error corrections and/or new features
              including related documentation, generally referred to as "Updates". Updates may also modify or
              delete in their entirety certain features and functionality. You agree that Toremy LLC has no
              obligation to provide any Updates or to continue to provide or enable any particular features or
              functionality. Based on your computer system or mobile device settings, when your computer
              system or mobile device is connected to the internet either:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>(a) the Application will automatically download and install all available Updates; or</li>
              <li>(b) you may receive notice or be prompted to download and install available Updates.</li>
            </ul>
            <p>
              You shall promptly download and install all Updates and acknowledge and agree that the
              Application or portions thereof may not properly operate should you fail to do so. You further
              agree that all Updates will be deemed part of the Application and be subject to all terms and
              conditions of this Agreement.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              7. Feedback
            </h2>
            <p>
              Upon submitting any Customer or User suggestions, proposals, ideas, recommendations, bug
              reports, ideas, improvements or other feedback regarding the Application ("Feedback"), you
              grant to Toremy LLC a royalty-free, fully paid, sub-licensable, transferable, non-exclusive,
              irrevocable, perpetual, worldwide right and license to make, use, sell, offer for sale, import,
              and otherwise exploit feedback (including by incorporation of such feedback into other Toremy
              LLC products without restriction. Feedback expressly excludes any Customer Confidential
              Information and Customer Data.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              8. Security
            </h2>
            <p>
              You and Toremy LLC will maintain reasonable administrative, physical, and technical security
              measures consistent with applicable law and current prevailing security practices and that are
              intended to protect against the loss, misuse, unauthorized access, alteration, or disclosure of
              Customer's Data. Such additional measures will include compliance with the Security and Privacy
              Guidelines, Exhibit A. You acknowledge that the Security and Privacy Guidelines may be updated
              from time to time and communicated to you as updates are implemented.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              9. Confidentiality
            </h2>
            <p>
              Each party agrees that all information of a confidential or proprietary nature disclosed by one
              party the other, or any of its affiliates, employees, or contractors whether in writing, orally,
              or through tangible methods that the disclosing party designates as confidential or proprietary
              will be treated as confidential. Each party further agrees to only share such confidential or
              proprietary information with employees that have a need to know. Each party further agrees
              that much, if not all the material and information which will come into the possession of each
              party consists of confidential material and will be treated as such. Exceptions to this would be
              any information that can be proven to be held by the other party prior to this agreement that
              was not held under a Non-Disclosure Agreement or was in the public domain at the time the
              party became aware of the confidential or proprietary information. Either party may reasonably
              request that the other party return or destroy within thirty days such confidential or proprietary
              information in writing and acknowledge in writing that the request has been completed.
            </p>
            <p className="ml-4">
              (a) Injunctive Relief. You acknowledge that breach of the confidentiality obligations may
              cause irreparable harm to Toremy LLC, the extent of which may be difficult to ascertain.
              Accordingly, you agree that Toremy LLC may be entitled to seek immediate injunctive
              relief in the event of breach of an obligation of confidentiality by you, and that Toremy
              LLC shall not be required to post a bond or show irreparable harm in order to obtain
              such injunctive relief.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              10. Changes to this Agreement
            </h2>
            <p>
              Any modifications to this Agreement must be set forth in writing and disclosed within the
              Application.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              11. Term and Termination
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                (a) The term of Agreement commences when you download/install the Application and
                will continue in effect until terminated by you or Toremy LLC as set forth in this
                Agreement.
              </li>
              <li>
                (b) Company may terminate this Agreement at any time without notice if it ceases to
                support the Application, which Company may do in its sole discretion. In addition, this
                Agreement will terminate immediately and automatically without any notice if you
                violate any of the terms and conditions of this Agreement.
              </li>
              <li>
                (c) Upon termination all rights granted to you under this Agreement will also terminate;
                and you must cease all use of the Application and delete all copies of the Application
                from your computer systems or mobile devices and accounts.
              </li>
              <li>
                (d) Termination will not limit any of Toremy LLC's rights or remedies at law or in equity.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              12. Disclaimer of Warranties
            </h2>
            <div className="glass rounded-2xl p-6">
              <p className="text-sm">
                THE APPLICATION IS PROVIDED TO YOU "AS IS" AND WITH ALL FAULTS AND DEFECTS WITHOUT
                WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, TOREMY
                LLC, ON ITS OWN BEHALF AND ON BEHALF OF ITS AFFILIATES AND ITS AND THEIR RESPECTIVE
                LICENSORS AND SERVICE PROVIDERS, EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS,
                IMPLIED, STATUTORY OR OTHERWISE, WITH RESPECT TO THE APPLICATION, INCLUDING ALL IMPLIED
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT,
                AND WARRANTIES THAT MAY ARISE OUT OF COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OR
                TRADE PRACTICE. WITHOUT LIMITATION TO THE FOREGOING, COMPANY PROVIDES NO WARRANTY OR
                UNDERTAKING, AND MAKES NO REPRESENTATION OF ANY KIND THAT THE APPLICATION WILL MEET YOUR
                REQUIREMENTS, ACHIEVE ANY INTENDED RESULTS, BE COMPATIBLE OR WORK WITH ANY OTHER SOFTWARE,
                APPLICATIONS, SYSTEMS OR SERVICES, OPERATE WITHOUT INTERRUPTION, MEET ANY PERFORMANCE OR
                RELIABILITY STANDARDS OR BE ERROR FREE OR THAT ANY ERRORS OR DEFECTS CAN OR WILL BE
                CORRECTED. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF OR LIMITATIONS ON IMPLIED
                WARRANTIES OR THE LIMITATIONS ON THE APPLICABLE STATUTORY RIGHTS OF A CONSUMER, SO SOME
                OR ALL OF THE ABOVE EXCLUSIONS AND LIMITATIONS MAY NOT APPLY TO YOU.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              13. Limitation of Liability
            </h2>
            <div className="glass rounded-2xl p-6">
              <p className="text-sm">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL TOREMY LLC OR ITS
                AFFILIATES, OR ANY OF ITS OR THEIR RESPECTIVE LICENSORS OR SERVICE PROVIDERS, HAVE ANY
                LIABILITY FOR DAMAGES ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY TO USE THE
                APPLICATION. THE FOREGOING LIMITATIONS WILL APPLY WHETHER SUCH DAMAGES ARISE OUT OF
                BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE) OR OTHERWISE AND REGARDLESS OF WHETHER
                SUCH DAMAGES WERE FORESEEABLE OR COMPANY WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS OF LIABILITY SO SOME OR ALL OF THE
                ABOVE LIMITATIONS OF LIABILITY MAY NOT APPLY TO YOU.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              14. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Toremy LLC and its officers, directors,
              employees, agents, affiliates, successors and assigns from and against any and all losses,
              damages, liabilities, deficiencies, claims, actions, judgments, settlements, interest, awards,
              penalties, fines, costs, or expenses of whatever kind, including attorneys' fees, arising from
              or relating to your use or misuse of the Application or your breach of this Agreement.
              Furthermore, you agree that Toremy LLC assumes no responsibility for the content you submit
              or make available through this Application.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              15. Force Majeure
            </h2>
            <p>
              Either party may choose to be excused of any further performance obligations in the event of
              a disastrous occurrence outside the control of either party, such as: an act of God (fires,
              explosions, earthquakes, hurricane, natural disasters, flooding, storms or infestation),
              pandemic, infestation, governmental order, or War, Invasion, Act of Foreign Enemies, Embargo,
              or other Hostility (whether declared or not), or any hazardous situation created outside the
              control of either party such as a riot, disorder, nuclear leak or explosion, or act or threat
              of terrorism. All invoices due to Toremy LLC must still be paid according to the Statement of Fees.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              16. Export Regulation
            </h2>
            <p>
              The Application may be subject to US export control laws, including the US Export Administration
              Act and its associated regulations. You shall not, directly or indirectly, export, re-export or
              release the Application to, or make the Application accessible from, any jurisdiction or country
              to which export, re-export or release is prohibited by law, rule or regulation. You shall comply
              with all applicable federal laws, regulations and rules, and complete all required undertakings
              (including obtaining any necessary export license or other governmental approval), prior to
              exporting, re-exporting, releasing or otherwise making the Application available outside the US.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              17. Severability
            </h2>
            <p>
              If any provision of this agreement shall be held to be invalid or unenforceable for any reason,
              the remaining provisions shall continue to be valid and enforceable. If a court finds that any
              provision of this agreement is invalid or unenforceable, but that by limiting such provision it
              would be valid and enforceable, then such provision shall be deemed to be written, construed,
              and enforced as so limited.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              18. Dispute Resolution
            </h2>
            <p>
              If a dispute arises under this Agreement, the parties agree to first submit the dispute to a
              mutually agreed-upon mediator in Baldwin County, Alabama. Any costs and fees other than
              attorney fees associated with the mediation will be shared equally between the parties. If
              the dispute is not resolved within 30 days after it is referred to the mediator, the Parties
              agree that the matter may be resolved in a court of law. If any court action is necessary to
              enforce this Agreement, the prevailing party will be entitled to reasonable attorney fees,
              costs, and expenses in addition to any other relief to which the party may be entitled.
            </p>
            <p className="mt-4">
              <strong className="text-[var(--color-pearl)]">Independent Contractor:</strong> Nothing in this Agreement creates a partnership or
              joint venture relationship. This Agreement is non-exclusive in nature and neither party shall
              limit the other from independently creating and marketing other products or services.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              19. Governing Law
            </h2>
            <p>
              This Agreement is governed by and construed in accordance with the internal laws of the State
              of Alabama without giving effect to any choice or conflict of law provision or rule. Any legal
              suit, action or proceeding arising out of or related to this Agreement or the Application shall
              be instituted exclusively in the courts of the State of Alabama located in Baldwin County. You
              waive any and all objections to the exercise of jurisdiction over you by such courts and to
              venue in such courts.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              20. Waiver
            </h2>
            <p>
              You hereby covenants and agrees to release, indemnify, defend, save and hold harmless Toremy
              LLC and their respective members, officers, directors, employees, independent contractors,
              subcontractors, agents, volunteers, heirs, successors, assignees, and owners from and against
              any and all loss, cost (including attorneys' fees), damage, expense, and liability (including
              statutory liability and liability under workers' compensation laws) in connection with claims,
              judgments, damages, penalties, fines, liabilities, losses, suits, administrative proceedings,
              arising out of any act of neglect by you, your agents, employees, contractors, clients, invitees,
              representatives, with respect to this Agreement. This indemnity shall survive the termination
              of this Agreement. Client hereby releases Toremy, LLC from any and all liability or responsibility
              to you or anyone claiming through or under you by way of subrogation. This Waiver and release
              of liability shall be construed broadly to provide a release and waiver to the maximum extent
              permissible under applicable law.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
