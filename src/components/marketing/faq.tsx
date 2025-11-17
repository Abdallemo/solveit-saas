import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <section id="faq" className="py-20">
    <div className="w-full max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is SolveIt?</AccordionTrigger>
          <AccordionContent>
            SolveIt is a SaaS platform that helps students post academic-related tasks and connect with solvers for mentoring or collaboration, ensuring academic integrity.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Is SolveIt free to use?</AccordionTrigger>
          <AccordionContent>
            Yes, registration and basic usage are free. However, posting tasks or mentorship sessions may involve service fees.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>How does payment and escrow work?</AccordionTrigger>
          <AccordionContent>
            Payments are held securely in escrow until both parties confirm task completion. This ensures fairness and prevents fraud.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>Can I offer mentorship instead of solving tasks?</AccordionTrigger>
          <AccordionContent>
            Yes! You can register as a mentor and provide guided assistance, including video calls and screen sharing.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>Is SolveIt safe and moderated?</AccordionTrigger>
          <AccordionContent>
            Yes, tasks and communications are monitored using AI-based moderation and admin review to maintain a respectful and academic-safe environment.
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
    </section>
  );
}
