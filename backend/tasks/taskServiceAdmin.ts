import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const normalizeStatus = (status?: string): 'to-do' | 'in-review' | 'done' | 'unknown' => {
  if (!status) return 'unknown';

  const value = status.toLowerCase().trim();

  if (value === 'to do' || value === 'todo' || value === 'to-do') return 'to-do';
  if (value === 'in review' || value === 'in-review' || value === 'inreview') return 'in-review';
  if (value === 'done') return 'done';

  return 'unknown';
};

export const taskServiceAdmin = {
  extractKeywords(title: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been'
    ]);

    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    return [...new Set(words)];
  },

  async matchTaskForCommit(
    projectId: string,
    commitMessage: string,
    githubUsername: string,
    isMainBranch: boolean = false
  ): Promise<void> {
    console.log('=== MATCHING TASK FOR COMMIT ===');
    console.log('Project ID:', projectId);
    console.log('Commit Message:', commitMessage);
    console.log('GitHub Username:', githubUsername);
    console.log('Is Main Branch:', isMainBranch);
    
    const messageKeywords = this.extractKeywords(commitMessage);
    console.log('Extracted Keywords from Commit:', messageKeywords);
    
    if (messageKeywords.length === 0) {
      console.log('⚠️  No valid keywords extracted from commit message');
      console.log('=== END MATCHING ===');
      return;
    }
    
    const targetStatuses = isMainBranch
      ? new Set(['to-do', 'in-review'])
      : new Set(['to-do']);

    console.log(
      `Checking normalized task statuses: ${Array.from(targetStatuses).join(', ')}`
    );

    const tasksSnapshot = await adminDb.collection('tasks')
      .where('projectId', '==', projectId)
      .get();

    const taskDocs = tasksSnapshot.docs.filter(taskDoc => {
      const taskStatus = normalizeStatus(taskDoc.data()?.status);
      return targetStatuses.has(taskStatus);
    });

    console.log(`Found candidate tasks: ${taskDocs.length}`);

    for (const taskDoc of taskDocs) {
        const task = taskDoc.data();
        const currentStatus = task.status || 'Unknown';
        console.log(`\n--- Checking Task: ${task.title}`);
        console.log('Task ID:', taskDoc.id);
        console.log('Current Status:', currentStatus);
        console.log('Task Keywords:', task.keywords || 'MISSING!');
        console.log('Assigned To:', task.assignedTo);
        
        // Check if task has keywords
        if (!task.keywords || !Array.isArray(task.keywords) || task.keywords.length === 0) {
          console.log('✗ Task has no keywords - regenerating from title');
          const regeneratedKeywords = this.extractKeywords(task.title);
          await taskDoc.ref.update({
            keywords: regeneratedKeywords,
            updatedAt: Timestamp.now()
          });
          console.log('✓ Keywords regenerated:', regeneratedKeywords);
          task.keywords = regeneratedKeywords;
        }
        
        const userDoc = await adminDb.collection('users').doc(task.assignedTo).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const userGithubUsername = userData?.githubUsername?.toLowerCase().trim();
          const commitGithubUsername = githubUsername.toLowerCase().trim();
          
          console.log('User GitHub Username:', userData?.githubUsername || 'NOT SET!');
          
          if (!userData?.githubUsername) {
            console.log('✗ User has no GitHub username set in their profile');
            continue;
          }
          
          if (userGithubUsername === commitGithubUsername) {
            console.log('✓ GitHub username matches!');
            
            const keywordMatch = task.keywords.some((keyword: string) => 
              messageKeywords.includes(keyword.toLowerCase())
            );
            
            console.log('Keyword match result:', keywordMatch);
            
            if (keywordMatch) {
              let newStatus: string;
              if (isMainBranch) {
                newStatus = 'Done';
              } else {
                newStatus = 'In Review';
              }
              
              await taskDoc.ref.update({
                status: newStatus,
                updatedAt: Timestamp.now()
              });
              
              console.log(`✅✅✅ SUCCESS! Task "${task.title}" moved from "${currentStatus}" to "${newStatus}"!`);
              console.log(`Task ID: ${taskDoc.id}`);
              console.log('=== END MATCHING ===');
              return;
            } else {
              console.log('✗ Keywords do not match');
              console.log('  Task keywords:', task.keywords);
              console.log('  Commit keywords:', messageKeywords);
              console.log('  Suggestion: Include one of these words in your commit:', task.keywords.join(', '));
            }
          } else {
            console.log('✗ GitHub username does not match');
            console.log(`  Expected: ${commitGithubUsername}`);
            console.log(`  Got: ${userGithubUsername}`);
            console.log('  Suggestion: Update GitHub username in user settings');
          }
        } else {
          console.log('✗ User document not found for ID:', task.assignedTo);
        }
      }
    
    console.log('\n⚠️  No matching tasks found');
    console.log('=== END MATCHING ===');
  },

  async matchTaskForMerge(
    projectId: string,
    prTitle: string,
    prBody: string,
    githubUsername: string
  ): Promise<void> {
    console.log('=== MATCHING TASK FOR PR MERGE ===');
    console.log('Project ID:', projectId);
    console.log('PR Title:', prTitle);
    console.log('GitHub Username:', githubUsername);
    
    const combinedText = `${prTitle} ${prBody}`;
    const prKeywords = this.extractKeywords(combinedText);
    console.log('Extracted Keywords from PR:', prKeywords);
    
    if (prKeywords.length === 0) {
      console.log('⚠️  No valid keywords extracted from PR title/body');
      console.log('=== END PR MERGE MATCHING ===');
      return;
    }
    
    const tasksSnapshot = await adminDb.collection('tasks')
      .where('projectId', '==', projectId)
      .get();

    const candidateTaskDocs = tasksSnapshot.docs
      .filter(taskDoc => {
        const normalized = normalizeStatus(taskDoc.data()?.status);
        return normalized === 'in-review' || normalized === 'to-do';
      })
      .sort((a, b) => {
        const aStatus = normalizeStatus(a.data()?.status);
        const bStatus = normalizeStatus(b.data()?.status);
        if (aStatus === bStatus) return 0;
        if (aStatus === 'in-review') return -1;
        if (bStatus === 'in-review') return 1;
        return 0;
      });

    console.log('Found candidate tasks for PR merge:', candidateTaskDocs.length);

    if (candidateTaskDocs.length === 0) {
      console.log('⚠️  No tasks in "In Review" or "To Do" status for this project');
      console.log('=== END PR MERGE MATCHING ===');
      return;
    }

    for (const taskDoc of candidateTaskDocs) {
      const task = taskDoc.data();
      console.log('\n--- Checking Task:', task.title);
      console.log('Task ID:', taskDoc.id);
      console.log('Current Status:', task.status || 'Unknown');
      console.log('Task Keywords:', task.keywords || 'MISSING!');
      
      // Check if task has keywords
      if (!task.keywords || !Array.isArray(task.keywords) || task.keywords.length === 0) {
        console.log('✗ Task has no keywords - regenerating from title');
        const regeneratedKeywords = this.extractKeywords(task.title);
        await taskDoc.ref.update({
          keywords: regeneratedKeywords,
          updatedAt: Timestamp.now()
        });
        console.log('✓ Keywords regenerated:', regeneratedKeywords);
        task.keywords = regeneratedKeywords;
      }
      
      const userDoc = await adminDb.collection('users').doc(task.assignedTo).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const userGithubUsername = userData?.githubUsername?.toLowerCase().trim();
        const commitGithubUsername = githubUsername.toLowerCase().trim();
        
        console.log('User GitHub Username:', userData?.githubUsername || 'NOT SET!');
        
        if (!userData?.githubUsername) {
          console.log('✗ User has no GitHub username set in their profile');
          continue;
        }
        
        if (userGithubUsername === commitGithubUsername) {
          console.log('✓ GitHub username matches!');
          
          const keywordMatch = task.keywords.some((keyword: string) => 
            prKeywords.includes(keyword.toLowerCase())
          );
          
          console.log('Keyword match result:', keywordMatch);
          
          if (keywordMatch) {
            await taskDoc.ref.update({
              status: 'Done',
              updatedAt: Timestamp.now()
            });
            console.log(`✅✅✅ SUCCESS! Task "${task.title}" moved to Done!`);
            console.log(`Task ID: ${taskDoc.id}`);
            console.log('=== END PR MERGE MATCHING ===');
            return;
          } else {
            console.log('✗ Keywords do not match');
            console.log('  Task keywords:', task.keywords);
            console.log('  PR keywords:', prKeywords);
            console.log('  Suggestion: Include one of these words in your PR title/description:', task.keywords.join(', '));
          }
        } else {
          console.log('✗ GitHub username does not match');
          console.log(`  Expected: ${commitGithubUsername}`);
          console.log(`  Got: ${userGithubUsername}`);
        }
      } else {
        console.log('✗ User document not found for ID:', task.assignedTo);
      }
    }
    console.log('\n⚠️  No matching tasks found');
    console.log('=== END PR MERGE MATCHING ===');
  }
};
