import { motion } from 'framer-motion';

export default function TermsPage(): React.JSX.Element {
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
            <span className="text-gradient">Terms & Conditions</span>
          </h1>
          <p className="text-[var(--color-mist)] text-center mb-12">
            Last modified July 8, 2024
          </p>

          <div className="prose-legal space-y-6 text-[var(--color-mist)] leading-relaxed">
            <div className="glass rounded-2xl p-6 mb-8">
              <p className="font-bold text-[var(--color-pearl)] m-0">
                PLEASE READ THESE TERMS CAREFULLY
              </p>
            </div>

            <p>
              These Terms of Use (the "Terms") govern your use of and access to{' '}
              <a href="https://www.one-stop-adjuster.com/" className="text-[var(--color-gold)] hover:underline">
                https://www.one-stop-adjuster.com/
              </a>{' '}
              and its sub-domains and affiliated sites, as well as Toremy LLC's ("Toremy LLC" "we", "our" or "us")
              pages and accounts on Facebook, Twitter, LinkedIn, Google Plus, and YouTube (the "Sites"). Please
              read both these Terms and our Privacy Policy carefully, which is incorporated into these Terms. By
              using any or all of the Sites, you accept and agree to be bound by these Terms. If you do not want
              to agree to be bound by these Terms, do not use the Sites. We may modify these Terms from time to
              time, and any modifications will be effective immediately when we post them. All changes we make
              will be reflected in the date at the top of the document. You are responsible for reviewing any
              modified terms. Your continued use of a Site following any changes means you accept and agree to
              any changes. For your convenience and future reference, the date of the most recent revision of
              these Terms is listed above so that you may compare different versions to determine what, if any,
              changes have been made.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              SITE CONTENT
            </h2>
            <p>
              Toremy LLC exclusively owns and controls the Sites, which provides information about our products
              and services and may, from time to time, provide access to educational materials pertaining to a
              variety of insurance adjusting topics. You agree that use or access to any or all of the Sites does
              not, standing alone, create any sort of representation or future promise. The unauthorized
              reproduction, use of, or theft of any content, written, photographic, or otherwise, is expressly
              prohibited. By using the Sites, you expressly agree to pay a fine of $500 per incident for any
              unauthorized use of our content, at the sole discretion of Toremy LLC.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              ARTIFICIAL INTELLIGENCE ("AI") DISCLAIMER
            </h2>
            <p>
              We may use AI technology to supplement or enhance content throughout the Sites and related materials.
              This may include, but is not limited to, AI-generated images, audio, or text ("AI-Generated Content").
              However, while these tools may be used to suggest or enhance Site Content, all published content on
              the Sites or correspondence is wholly human, including but not limited to all opinions, thoughts, and
              ideas. As such, we expressly retain all copyright ownership to the Site Content. By visiting the Sites,
              you agree and acknowledge that we are not required to notify you when or how AI technologies are used.
            </p>
            <p>
              While we have made reasonable efforts to ensure the accuracy and completeness of AI-Generated Content,
              you agree and understand that we expressly disclaim the accuracy of AI-Generated Content, including any
              and all liability for any errors or omissions in the Content produced by AI technology, and expressly
              advise that you exercise caution when relying on such content. As with all Site Content, you agree that
              use or access to any of the information provided on or knowledge gleaned from the Sites, including
              AI-Generated Content, does not create any sort of representation or future promise, and that use of any
              AI-Generated Content on the Sites is at your own risk.
            </p>
            <p>
              We reserve the right to modify or remove any AI-Generated Content at any time without notice. If you
              have any questions or concerns about the accuracy of AI-generated content, please contact us at{' '}
              <a href="mailto:support@one-stop-adjuster.com" className="text-[var(--color-gold)] hover:underline">
                support@one-stop-adjuster.com
              </a>{' '}
              for more information.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              INTELLECTUAL PROPERTY
            </h2>
            <p>
              Unless explicitly stated otherwise, as between you and Toremy LLC, Toremy LLC owns all right, title,
              and interest in and to the Sites, including, without limitation, graphics, site content, design,
              organization, compilation and other matters related to or included on the Sites. Our name, Toremy LLC
              and all related names, product and service names, logos, slogans, and designs are my trademarks and
              you may not use these marks without my prior written permission. All other names, logos, product and
              service names, designs and slogans on the Sites are the trademarks of their respective owners and
              should not be used without those respective owners' permission. You are granted a non-exclusive,
              non-transferable, revocable license to access and use the Sites and the resources available for
              download from the Website strictly in accordance with these Terms.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              THIRD PARTY RIGHTS
            </h2>
            <p>
              Content and materials posted to the Site may be the copyrighted content of others ("Third Party Content")
              that is used by Toremy LLC either by permission or under Section 107 of the Copyright Act as "fair use"
              for purposes such as education and research. We respect the intellectual property of others and ask that
              you do the same. Users must obtain permission from the owners of any Third-Party Content before copying,
              distributing or otherwise using those materials. Except as otherwise expressly permitted under copyright
              law, no copying, redistribution, retransmission, publication, or commercial exploitation of downloaded
              material will be permitted without the express permission of the copyright owner.
            </p>
            <p>
              If you believe that your work has been copied on one or more of the Sites in a way that constitutes
              copyright infringement or otherwise violates your intellectual property rights, please contact us via
              email at the contact information listed below and provide the following:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>(i) identification of what is claimed to have been infringed;</li>
              <li>(ii) identification of what is claimed to be infringing;</li>
              <li>(iii) your contact information (or the contact information of the person we need to contact about the infringement);</li>
              <li>(iv) a statement that the person submitting the complaint is doing so with a good faith belief that use of the material in the manner complained of is not authorized by the owner, its agent, or the law;</li>
              <li>(v) a statement that the information provided is accurate, and under penalty of perjury;</li>
              <li>(vi) a physical or electronic signature of the person submitting the complaint; and</li>
              <li>(vii) if that person is not the owner of the content at issue, a statement that the person submitting the complaint is authorized to act on the owner's behalf.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              LINKING TO OUR SITES
            </h2>
            <p>
              Anyone linking to the Sites must comply with all applicable laws and must not:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>(i) misrepresent its relationship with Toremy LLC;</li>
              <li>(ii) present false or misleading information about Toremy LLC; or</li>
              <li>(iii) contain content that is reasonably considered profanity, offensive, defamatory, vulgar, or unlawful.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              ADVERTISEMENTS AND AFFILIATE LINKS
            </h2>
            <p>
              I may at times include advertisements on the Sites. Your correspondence or business dealings with, or
              participation in promotions of, advertisers found on or through the Sites are solely between you and
              such advertiser. Any opinions, advice, statements, services, offers, or other information or content
              expressed or made available by advertisers, including information providers, or any other end users
              are those of the respective author(s) and not our own. You agree that we shall not be responsible or
              liable for any loss or damage of any sort incurred as a result of any such dealings or as the result
              of the presence of such advertisers.
            </p>
            <p>
              We may include affiliate links to promote certain services, platforms, or products, either on our own
              site, or from a third-part site. We will use reasonable effort to notify you of affiliate links that
              we link on the Sites; however, we encourage you to reach out to us with any questions you may have
              regarding affiliate links. This disclosure is intended to comply with the United States Federal Trade
              Commission rules regarding advertising and marketing. We disclaim any and all liability that may result
              from your purchase from any affiliate link we post, and by clicking on any affiliate link contained on
              this website or related communications, you accept express liability for the benefits or consequences
              thereof.
            </p>
            <p>
              You may find links to other websites on a Site. These links are provided solely as a convenience to you
              and not as an endorsement by Toremy LLC of the contents on such third-party sites, and we expressly
              disclaim any representations regarding the content or accuracy of materials on such third-party websites.
              You acknowledge and agree that Toremy LLC shall not be responsible or liable, directly or indirectly, for
              any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such
              content, goods or products available on or through any such linked site. You agree that it is your
              responsibility to evaluate the accuracy, completeness, or usefulness of any information, opinion, advice,
              etc., or other content available through such third-party sites.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              EARNINGS DISCLAIMER
            </h2>
            <p>
              You understand and agree that we make no financial claims, income claims, nor do we make any guarantee
              of any kind regarding your potential income that could be generated via our communications, or the
              purchase or license of any of our products. Past results are not an indication of future results. We do
              not guarantee that you will earn any income simply by purchasing materials from our company, as your
              revenue is solely dependent upon your actions or non-actions.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              DISCLAIMER AND LIMITATION OF LIABILITY
            </h2>
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-[var(--color-mist)]">
                THE SITES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTY OF ANY KIND. TOREMY
                LLC, TOGETHER WITH ITS AFFILIATES, LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS OR
                DIRECTORS (THE "RELEASED PARTIES"), SPECIFICALLY DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
                INCLUDING, BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT AND WARRANTIES THAT MAY ARISE OUT OF COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE
                OR TRADE PRACTICE. THE RELEASED PARTIES DO NOT GUARANTEE THE RELIABILITY, ACCURACY, COMPLETENESS,
                SAFETY, TIMELINESS, LEGALITY, USEFULNESS, ADEQUACY OR SUITABILITY OF ANY OF THE INFORMATION OR CONTENT
                ON THE SITES. ACCORDINGLY, YOU AGREE TO EXERCISE CAUTION, DISCRETION AND COMMON SENSE WHEN USING THE
                SITES. THE ENTIRE RISK FOR USE OF THE SITE AND/OR SERVICES IS BORNE BY YOU. TO THE MAXIMUM EXTENT
                PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE RELEASED PARTIES BE LIABLE FOR ANY DIRECT, INDIRECT,
                SPECIAL, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO ACCESS
                THE SITES, INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF GOODWILL, WORK DISRUPTIONS, COMPUTER
                FAILURE OR MALFUNCTION, OR ANY AND ALL OTHER PERSONAL OR COMMERCIAL DAMAGES OR LOSSES, EVEN IF ADVISED
                OF THE POSSIBILITY THEREOF, AND REGARDLESS OF THE LEGAL OR EQUITABLE THEORY (CONTRACT, TORT, BREACH OF
                WARRANTY OR OTHERWISE) UPON WHICH THE CLAIM IS BASED. THE RELEASED PARTIES ARE NOT RESPONSIBLE FOR ANY
                LIABILITY ARISING OUT OF THE POSTINGS OR ANY MATERIAL LINKED THROUGH THE SITES. YOUR SOLE REMEDY WITH
                RESPECT TO ANY CLAIM ARISING OUT OF YOUR USE OF THE SITES IS TO CEASE USING THE SITES.
              </p>
            </div>
            <p className="mt-4">
              Some jurisdictions do not allow the disclaimer of implied warranties and/or limitations of liability, so
              a portion of this language may not apply to you. In such a case, any such disclaimer or limitation of
              liability is limited to the minimum extent permissible under applicable law.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              CHOICE OF LAW AND VENUE
            </h2>
            <p>
              These Terms are governed by the laws of the State of Alabama without regard to any conflict of laws. For
              any dispute regarding these Terms or the Sites, you agree to submit to the personal and exclusive
              jurisdiction and venue of the federal and state courts located in Baldwin County, Alabama.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              YOUR COMMENTS AND CONCERNS
            </h2>
            <p>
              This website is operated by Toremy LLC, 9311 D'Olive Road, Spanish Fort, AL 36527. All other feedback,
              comments, requests for technical support and other communications relating to the Sites should be
              directed to:{' '}
              <a href="mailto:support@one-stop-adjuster.com" className="text-[var(--color-gold)] hover:underline">
                support@one-stop-adjuster.com
              </a>.
            </p>
            <p className="mt-4">
              Thank you for visiting the Sites!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
