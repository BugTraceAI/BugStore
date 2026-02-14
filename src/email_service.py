import jinja2
from src.database import SessionLocal
from src.models import EmailTemplate

def render_template(template_name: str, context: dict):
    """
    Renders an email template by name.
    V-027: Vulnerable to Server-Side Template Injection (SSTI).
    """
    db = SessionLocal()
    try:
        template = db.query(EmailTemplate).filter(EmailTemplate.name == template_name).first()
        if not template:
            return None
        
        # V-027: Using Jinja2 Template directly on user-controllable input (DB content)
        # without sandbox.
        jinja_template = jinja2.Template(template.body)
        rendered_body = jinja_template.render(**context)
        
        jinja_subject = jinja2.Template(template.subject)
        rendered_subject = jinja_subject.render(**context)
        
        return {
            "subject": rendered_subject,
            "body": rendered_body
        }
    except Exception as e:
        print(f"Template rendering error: {e}")
        return {"subject": "Error", "body": f"Error rendering template: {str(e)}"}
    finally:
        db.close()

def preview_template_raw(body: str, context: dict):
    """
    Previews a template string directly. 
    Useful for the template editor live preview.
    """
    try:
        t = jinja2.Template(body)
        return t.render(**context)
    except Exception as e:
        return f"Error: {str(e)}"
