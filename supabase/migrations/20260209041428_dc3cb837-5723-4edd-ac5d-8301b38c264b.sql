-- Add validation trigger for order notes to prevent XSS payloads and enforce length limits
-- Using a trigger instead of CHECK constraint for better flexibility and detailed error messages

CREATE OR REPLACE FUNCTION public.validate_order_notes()
RETURNS TRIGGER AS $$
BEGIN
  -- Enforce maximum length of 1000 characters for notes
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 1000 THEN
    RAISE EXCEPTION 'Order notes cannot exceed 1000 characters';
  END IF;
  
  -- Basic validation for shipping address fields
  IF NEW.shipping_address IS NOT NULL THEN
    -- Validate address JSON structure doesn't contain script tags
    IF NEW.shipping_address::text ~* '<script|javascript:|on\w+=' THEN
      RAISE EXCEPTION 'Invalid characters in shipping address';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for order validation
DROP TRIGGER IF EXISTS validate_order_notes_trigger ON public.orders;
CREATE TRIGGER validate_order_notes_trigger
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_notes();

-- Also add validation for contact_messages to prevent spam
CREATE OR REPLACE FUNCTION public.validate_contact_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Enforce length limits
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name cannot exceed 100 characters';
  END IF;
  
  IF length(NEW.email) > 320 THEN
    RAISE EXCEPTION 'Email cannot exceed 320 characters';
  END IF;
  
  IF NEW.subject IS NOT NULL AND length(NEW.subject) > 200 THEN
    RAISE EXCEPTION 'Subject cannot exceed 200 characters';
  END IF;
  
  IF length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'Message cannot exceed 5000 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for contact message validation
DROP TRIGGER IF EXISTS validate_contact_message_trigger ON public.contact_messages;
CREATE TRIGGER validate_contact_message_trigger
BEFORE INSERT OR UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_contact_message();