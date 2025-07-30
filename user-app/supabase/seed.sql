-- Seed data for PinkyTrust application

-- Insert sample events
INSERT INTO public.events (title, description, date, time, end_time, location, address, category, type, price, max_attendees, organizer, tags, featured, registration_required, image_url) VALUES
('Free Mammography Screening', 'Comprehensive mammography screening with certified radiologists. No insurance required. Results available immediately.', '2024-03-15', '09:00', '17:00', 'Community Health Center', '123 Health St, Downtown', 'screening', 'in-person', 0, 50, '{"name": "City Health Department", "type": "government", "verified": true, "rating": 4.8}', ARRAY['free', 'mammogram', 'early-detection'], true, true, '/images/mammography.jpg'),

('Breast Cancer Awareness Workshop', 'Educational workshop covering risk factors, prevention strategies, and early detection methods.', '2024-03-20', '18:00', '20:00', 'Women''s Health Center', '456 Wellness Ave, Midtown', 'education', 'in-person', 25, 30, '{"name": "Women''s Health Foundation", "type": "nonprofit", "verified": true, "rating": 4.9}', ARRAY['education', 'prevention', 'awareness'], true, true, '/images/workshop.jpg'),

('Virtual Support Group Meeting', 'Monthly support group for breast cancer survivors and their families. Safe space to share experiences and find community.', '2024-03-25', '19:00', '20:30', 'Online Meeting', 'Zoom Link Provided', 'support', 'virtual', 0, 25, '{"name": "Survivor Network", "type": "nonprofit", "verified": true, "rating": 4.7}', ARRAY['support', 'survivors', 'community'], false, true, '/images/support-group.jpg'),

('Pink Ribbon 5K Run/Walk', 'Annual fundraising event to support breast cancer research and patient assistance programs.', '2024-04-10', '08:00', '12:00', 'Central Park', 'Main Entrance, Central Park', 'fundraising', 'in-person', 35, 500, '{"name": "Pink Ribbon Foundation", "type": "nonprofit", "verified": true, "rating": 4.8}', ARRAY['fundraising', 'exercise', 'community'], true, true, '/images/5k-run.jpg'),

('Nutrition and Wellness Seminar', 'Learn about nutrition strategies for cancer prevention and recovery. Includes meal planning and recipe sharing.', '2024-04-15', '14:00', '16:00', 'Wellness Studio', '789 Healthy Way, Uptown', 'education', 'hybrid', 15, 40, '{"name": "Nutrition Experts", "type": "corporate", "verified": true, "rating": 4.6}', ARRAY['nutrition', 'wellness', 'prevention'], false, true, '/images/nutrition.jpg');

-- Insert assessment questions
INSERT INTO public.assessment_questions (question_id, question, subtitle, type, options, weight, category, help_text, min_value, max_value, unit, order_index) VALUES
('age', 'What is your age?', 'Age is an important factor in health assessment', 'number', null, 2, 'demographic', 'Age helps us provide personalized health recommendations based on your life stage.', 18, 100, 'years', 1),

('family_breast_cancer', 'Do you have a family history of breast cancer?', 'Including mother, sister, daughter, or grandmother', 'boolean', null, 3, 'family_history', 'Family history is one of the most significant risk factors for breast cancer.', null, null, null, 2),

('family_ovarian_cancer', 'Do you have a family history of ovarian cancer?', 'Including mother, sister, daughter, or grandmother', 'boolean', null, 2, 'family_history', 'Ovarian cancer can be linked to similar genetic factors as breast cancer.', null, null, null, 3),

('previous_biopsies', 'Have you had any breast biopsies?', 'Including both benign and malignant results', 'boolean', null, 2, 'personal_history', 'Previous biopsies may indicate areas that need continued monitoring.', null, null, null, 4),

('hormone_therapy', 'Are you currently using hormone replacement therapy?', 'Including estrogen or combination therapies', 'select', '["Never used", "Previously used", "Currently using"]', 2, 'personal_history', 'Hormone therapy can affect breast cancer risk.', null, null, null, 5),

('exercise_frequency', 'How often do you exercise?', 'Include any physical activity like walking, sports, or gym workouts', 'select', '["Daily", "3-4 times per week", "1-2 times per week", "Rarely", "Never"]', 1, 'lifestyle', 'Regular exercise can help reduce cancer risk.', null, null, null, 6),

('alcohol_consumption', 'How much alcohol do you typically consume?', 'Be honest - this information is confidential', 'select', '["None", "1-3 drinks per week", "4-7 drinks per week", "More than 7 drinks per week"]', 1, 'lifestyle', 'Alcohol consumption is linked to increased breast cancer risk.', null, null, null, 7),

('breast_changes', 'Have you noticed any changes in your breasts recently?', 'Including lumps, skin changes, or nipple discharge', 'boolean', null, 4, 'symptoms', 'Any breast changes should be evaluated by a healthcare provider.', null, null, null, 8);

-- Insert awareness content
INSERT INTO public.awareness_content (title, subtitle, description, category, type, difficulty, read_time, author, image_url, tags, featured, is_expert_reviewed, medical_review_date, learning_objectives, certificate, estimated_completion_time) VALUES
('Complete Guide to Breast Self-Examination', 'Learn the proper technique for monthly self-examinations', 'A comprehensive guide covering the step-by-step process of breast self-examination, including what to look for and when to contact your healthcare provider.', 'detection', 'interactive', 'beginner', 15, '{"name": "Dr. Sarah Johnson", "credentials": "MD, Oncologist", "institution": "City Medical Center"}', '/images/self-exam.jpg', ARRAY['self-exam', 'early-detection', 'prevention'], true, true, '2024-01-10', ARRAY['Understand the importance of regular self-examination', 'Learn the proper technique for breast self-examination', 'Identify normal vs. abnormal findings', 'Know when to contact a healthcare provider'], true, '15-20 minutes'),

('Understanding Breast Cancer Risk Factors', 'Comprehensive overview of modifiable and non-modifiable risk factors', 'Learn about the various factors that can influence your breast cancer risk, including genetics, lifestyle, and environmental factors.', 'prevention', 'article', 'intermediate', 12, '{"name": "Dr. Michael Chen", "credentials": "MD, PhD", "institution": "Research Institute"}', '/images/risk-factors.jpg', ARRAY['risk-factors', 'genetics', 'prevention'], true, true, '2024-01-08', ARRAY['Identify major risk factors for breast cancer', 'Distinguish between modifiable and non-modifiable risk factors', 'Understand the role of genetics in breast cancer risk', 'Learn about lifestyle modifications for risk reduction'], false, '12-15 minutes'),

('Mammography Screening Guidelines', 'When and how often to get mammograms', 'Understand the current guidelines for mammography screening, what to expect during the procedure, and how to interpret results.', 'detection', 'video', 'beginner', 14, '{"name": "Dr. Lisa Rodriguez", "credentials": "MD, Radiologist", "institution": "Imaging Center"}', '/images/mammography.jpg', ARRAY['mammography', 'screening', 'guidelines'], false, true, '2024-01-01', ARRAY['Understand the importance of mammography screening', 'Learn about different types of mammograms', 'Prepare properly for your screening', 'Interpret mammography results'], false, '14-18 minutes'),

('Coping with Diagnosis: Emotional Support', 'Managing the emotional impact of a breast cancer diagnosis', 'A comprehensive guide to understanding and managing the emotional challenges that come with a breast cancer diagnosis.', 'support', 'interactive', 'beginner', 45, '{"name": "Dr. Amanda Foster", "credentials": "PhD, Clinical Psychologist", "institution": "Cancer Support Center"}', '/images/emotional-support.jpg', ARRAY['emotional-health', 'coping', 'support'], true, true, '2023-12-28', ARRAY['Understand normal emotional responses to diagnosis', 'Develop healthy coping strategies', 'Build effective support networks', 'Communicate with healthcare providers'], false, '45-50 minutes');

-- Insert community groups
INSERT INTO public.community_groups (name, description, category, member_count, next_meeting, location, image_url) VALUES
('Breast Cancer Survivors', 'Support group for women who have completed treatment and are in recovery. Share experiences, celebrate milestones, and support each other.', 'support', 234, '2024-03-18 18:30:00', 'Community Center Room A', '/images/survivors-group.jpg'),

('Caregivers Support', 'For family members and friends supporting loved ones through their journey. Share tips, experiences, and find comfort.', 'caregivers', 156, '2024-03-22 18:30:00', 'Online Meeting', '/images/caregivers-group.jpg'),

('Young Survivors', 'Support group specifically for women diagnosed under 40. Navigate unique challenges together.', 'support', 78, '2024-03-24 15:00:00', 'Hope Center', '/images/young-survivors.jpg'),

('Wellness & Recovery', 'Focus on nutrition, exercise, and holistic wellness during and after treatment.', 'education', 312, '2024-03-20 17:00:00', 'Wellness Studio', '/images/wellness-group.jpg');

-- Insert sample community posts
INSERT INTO public.community_posts (content, tags, type, likes, comments_count, is_anonymous) VALUES
('Just finished my last chemo session! 🎉 The journey has been tough, but the support from this community has meant everything. To anyone just starting - you are stronger than you know! 💪', ARRAY['milestone', 'chemo', 'support'], 'celebration', 89, 23, false),

('Looking for recommendations for comfortable post-surgery bras. What brands have worked best for you? Comfort is my top priority right now.', ARRAY['recovery', 'comfort', 'recommendations'], 'question', 34, 18, false),

('Sharing my favorite healthy smoothie recipe that helped me through treatment! Packed with antioxidants and easy on the stomach. Recipe in comments 👇', ARRAY['nutrition', 'recipes', 'wellness'], 'tip', 67, 15, false),

('Today marks 5 years cancer-free! 🌸 Grateful for every day and for this amazing community that supported me through the darkest times. Never give up hope!', ARRAY['milestone', 'survivor', 'hope'], 'celebration', 156, 32, false);

-- Update event current_attendees based on registrations
UPDATE public.events SET current_attendees = 32 WHERE title = 'Free Mammography Screening';
UPDATE public.events SET current_attendees = 18 WHERE title = 'Breast Cancer Awareness Workshop';
UPDATE public.events SET current_attendees = 12 WHERE title = 'Virtual Support Group Meeting';
UPDATE public.events SET current_attendees = 145 WHERE title = 'Pink Ribbon 5K Run/Walk';
UPDATE public.events SET current_attendees = 25 WHERE title = 'Nutrition and Wellness Seminar';
