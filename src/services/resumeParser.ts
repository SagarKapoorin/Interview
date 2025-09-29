export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  text: string;
}

export class ResumeParser {
  async parseFile(file: File): Promise<ParsedResumeData> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string) || '';

        const parsedData = this.extractFields(text, file.name);
        resolve(parsedData);
      };
      reader.readAsText(file);
    });
  }

  private extractFields(text: string, filename: string): ParsedResumeData {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    // More flexible phone regex: matches international formats with 8+ digits
    const phoneRegex = /(?:\+?\d[\d\s().-]{7,}\d)/;
    const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

    const email = text.match(emailRegex)?.[0];
    const phone = text.match(phoneRegex)?.[0];
    const name = text.match(nameRegex)?.[0] || this.extractNameFromFilename(filename);

    return {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      text: text,
    };
  }

  private extractNameFromFilename(filename: string): string {
    return filename
      .replace(/\.(pdf|docx|doc)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export const resumeParser = new ResumeParser();
