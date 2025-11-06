// Default code templates for different programming languages

export type SupportedLanguage = "javascript" | "python" | "java" | "cpp" | "c";

export interface CodeTemplate {
  language: string;
  code: string;
  judge0LanguageId: number; // Judge0 language ID
}

// Judge0 Language IDs (common ones)
// Full list: https://github.com/judge0/judge0/blob/master/CHANGELOG.md
export const JUDGE0_LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  javascript: 63, // Node.js 12.14.0
  python: 71, // Python 3.8.1
  java: 62, // OpenJDK 13.0.1
  cpp: 54, // GCC 9.2.0
  c: 50, // GCC 9.2.0
};

export const CODE_TEMPLATES: Record<SupportedLanguage, string> = {
  javascript: `// Write your solution here
function solution(input) {
    // Your code here
    return input;
}

// Test your solution
console.log(solution("test"));
`,

  python: `# Write your solution here
def solution(input):
    # Your code here
    return input

# Test your solution
if __name__ == "__main__":
    print(solution("test"))
`,

  java: `// Write your solution here
public class Solution {
    public static String solution(String input) {
        // Your code here
        return input;
    }
    
    public static void main(String[] args) {
        System.out.println(solution("test"));
    }
}
`,

  cpp: `// Write your solution here
#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your code here
    return input;
}

int main() {
    cout << solution("test") << endl;
    return 0;
}
`,

  c: `// Write your solution here
#include <stdio.h>
#include <string.h>

char* solution(char* input) {
    // Your code here
    return input;
}

int main() {
    char test[] = "test";
    printf("%s\\n", solution(test));
    return 0;
}
`,
};

export function getCodeTemplate(
  language: SupportedLanguage,
  customTemplate?: string
): string {
  if (customTemplate) {
    return customTemplate;
  }
  return CODE_TEMPLATES[language] || CODE_TEMPLATES.javascript;
}

export function getJudge0LanguageId(
  language: SupportedLanguage
): number {
  return JUDGE0_LANGUAGE_IDS[language] || JUDGE0_LANGUAGE_IDS.javascript;
}

export function getLanguageFromExtension(extension: string): SupportedLanguage {
  const ext = extension.toLowerCase().replace(".", "");
  const mapping: Record<string, SupportedLanguage> = {
    js: "javascript",
    javascript: "javascript",
    py: "python",
    python: "python",
    java: "java",
    cpp: "cpp",
    cxx: "cpp",
    cc: "cpp",
    c: "c",
  };
  return mapping[ext] || "javascript";
}

export function getLanguageDisplayName(language: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    javascript: "JavaScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
  };
  return names[language] || "JavaScript";
}

