import React from 'react'

interface EmailTemplateProps {
  taskTitle: string
  projectName: string
  deadline: string
  memberName: string
}

export const TaskReminderEmailTemplate = ({
  taskTitle,
  projectName,
  deadline,
  memberName
}: EmailTemplateProps) => {
  return (
    <html>
      <head>
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 16px;
              color: #374151;
              margin-bottom: 20px;
            }
            .message {
              font-size: 15px;
              color: #6b7280;
              margin-bottom: 30px;
            }
            .task-details {
              background-color: #f9fafb;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .task-details h3 {
              margin: 0 0 15px 0;
              color: #111827;
              font-size: 18px;
            }
            .detail-row {
              display: flex;
              margin: 10px 0;
              font-size: 14px;
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
              min-width: 100px;
            }
            .detail-value {
              color: #6b7280;
            }
            .deadline-highlight {
              background-color: #fef3c7;
              color: #92400e;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 600;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 5px 0;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>Bundle Task Reminder</h1>
          </div>
          <div className="content">
            <p className="greeting">Hi {memberName},</p>
            <p className="message">
              This is a friendly reminder that one of your tasks is due tomorrow. Please ensure it is completed on time to keep the project on track.
            </p>
            <div className="task-details">
              <h3>Task Details</h3>
              <div className="detail-row">
                <span className="detail-label">Task:</span>
                <span className="detail-value">{taskTitle}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Project:</span>
                <span className="detail-value">{projectName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Deadline:</span>
                <span className="deadline-highlight">{deadline}</span>
              </div>
            </div>
            <p className="message">
              Please log in to Bundle to view the task details and update its status if you have already completed it.
            </p>
            <div style={{ textAlign: 'center' }}>
              <a href="https://bundle.app" className="cta-button">
                View Task
              </a>
            </div>
          </div>
          <div className="footer">
            <p>This is an automated reminder from Bundle</p>
            <p>To manage your notification preferences, log in to your account</p>
          </div>
        </div>
      </body>
    </html>
  )
}

export const generateTaskReminderHTML = (props: EmailTemplateProps): string => {
  const { taskTitle, projectName, deadline, memberName } = props
  
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f4f4f5;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 16px;
        color: #374151;
        margin-bottom: 20px;
      }
      .message {
        font-size: 15px;
        color: #6b7280;
        margin-bottom: 30px;
      }
      .task-details {
        background-color: #f9fafb;
        border-left: 4px solid #667eea;
        padding: 20px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .task-details h3 {
        margin: 0 0 15px 0;
        color: #111827;
        font-size: 18px;
      }
      .detail-row {
        margin: 10px 0;
        font-size: 14px;
      }
      .detail-label {
        font-weight: 600;
        color: #374151;
        display: inline-block;
        min-width: 100px;
      }
      .detail-value {
        color: #6b7280;
      }
      .deadline-highlight {
        background-color: #fef3c7;
        color: #92400e;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 20px 0;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }
      .footer p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Bundle Task Reminder</h1>
      </div>
      <div class="content">
        <p class="greeting">Hi ${memberName},</p>
        <p class="message">
          This is a friendly reminder that one of your tasks is due tomorrow. Please ensure it is completed on time to keep the project on track.
        </p>
        <div class="task-details">
          <h3>Task Details</h3>
          <div class="detail-row">
            <span class="detail-label">Task:</span>
            <span class="detail-value">${taskTitle}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Project:</span>
            <span class="detail-value">${projectName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Deadline:</span>
            <span class="deadline-highlight">${deadline}</span>
          </div>
        </div>
        <p class="message">
          Please log in to Bundle to view the task details and update its status if you have already completed it.
        </p>
        <div style="text-align: center;">
          <a href="https://bundle.app" class="cta-button">
            View Task
          </a>
        </div>
      </div>
      <div class="footer">
        <p>This is an automated reminder from Bundle</p>
        <p>To manage your notification preferences, log in to your account</p>
      </div>
    </div>
  </body>
</html>
  `.trim()
}

interface WelcomeEmailProps {
  name: string
}

export const generateWelcomeEmailHTML = ({ name }: WelcomeEmailProps): string => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f4f4f5;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0 0 10px 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: 16px;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 18px;
        color: #111827;
        margin-bottom: 20px;
        font-weight: 600;
      }
      .message {
        font-size: 15px;
        color: #6b7280;
        margin-bottom: 20px;
        line-height: 1.7;
      }
      .feature-box {
        background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        border-radius: 8px;
        padding: 25px;
        margin: 30px 0;
      }
      .feature-title {
        color: #111827;
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 15px 0;
      }
      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .feature-item {
        padding: 10px 0;
        color: #374151;
        font-size: 14px;
        display: flex;
        align-items: center;
      }
      .feature-item::before {
        content: '✓';
        display: inline-block;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 24px;
        margin-right: 12px;
        font-weight: bold;
        flex-shrink: 0;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        padding: 14px 35px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 25px 0;
        font-size: 16px;
        box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
      }
      .tips-section {
        background-color: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 20px;
        margin: 25px 0;
        border-radius: 4px;
      }
      .tips-title {
        color: #92400e;
        font-weight: 700;
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      .tips-text {
        color: #78350f;
        font-size: 14px;
        margin: 5px 0;
      }
      .footer {
        background-color: #f9fafb;
        padding: 25px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }
      .footer p {
        margin: 5px 0;
      }
      .footer a {
        color: #667eea;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Welcome to Bundle!</h1>
        <p>Let's get you started on your journey to better project management</p>
      </div>
      <div class="content">
        <p class="greeting">Hi ${name}!</p>
        <p class="message">
          We're thrilled to have you join Bundle! You've just taken the first step towards streamlining your project management and boosting your team's productivity.
        </p>
        <p class="message">
          Bundle is designed to help you and your team collaborate seamlessly, track tasks effortlessly, and stay on top of deadlines with ease.
        </p>
        
        <div class="feature-box">
          <h3 class="feature-title">What you can do with Bundle:</h3>
          <ul class="feature-list">
            <li class="feature-item">Create and manage projects with your team</li>
            <li class="feature-item">Assign tasks and track progress in real-time</li>
            <li class="feature-item">Get automated deadline reminders</li>
            <li class="feature-item">Integrate with GitHub for seamless workflow</li>
            <li class="feature-item">Visualize project progress with interactive dashboards</li>
            <li class="feature-item">Chat with your team members in real-time</li>
          </ul>
        </div>

        <div class="tips-section">
          <p class="tips-title">💡 Quick Tip:</p>
          <p class="tips-text">Start by creating your first project and inviting team members. The more you use Bundle, the more productive you'll become!</p>
        </div>

        <div style="text-align: center;">
          <a href="https://bundle.app/projects" class="cta-button">
            Get Started Now
          </a>
        </div>

        <p class="message">
          If you have any questions or need help getting started, our documentation and support team are here to help you every step of the way.
        </p>
        
        <p class="message" style="margin-top: 30px;">
          Happy collaborating! 🚀<br>
          <strong>The Bundle Team</strong>
        </p>
      </div>
      <div class="footer">
        <p>This email was sent to you because you created a Bundle account</p>
        <p>Need help? Visit our <a href="https://bundle.app">Help Center</a></p>
      </div>
    </div>
  </body>
</html>
  `.trim()
}
