# from app.db.session import SessionLocal
# from app.models.training_model import TrainingContent


# # def get_all_training_content():
# #     db = SessionLocal()
# #     try:
# #         items = db.query(TrainingContent).all()
# #         return [
# #             {
# #                 "id": item.id,
# #                 "title": item.title,
# #                 "content_type": item.content_type,
# #                 "file_path": item.file_path,
# #                 "w3_content": item.w3_content,
# #                 "topic": item.topic,
# #                 "created_at": str(item.created_at)
# #             }
# #             for item in items
# #         ]
# #     finally:
# #         db.close()

# def get_all_training_content():
#     db = SessionLocal()
#     try:
#         items = db.query(TrainingContent).all()

#         grouped = {}

#         for item in items:
#             topic = item.topic or "General"

#             if topic not in grouped:
#                 grouped[topic] = []

#             grouped[topic].append({
#                 "id": item.id,
#                 "title": item.title,
#                 "content_type": item.content_type,
#                 "file_path": item.file_path,
#                 "w3_content": item.w3_content,
#                 "created_at": str(item.created_at)
#             })

#         return grouped

#     finally:
#         db.close()


# def create_training_content(title, content_type, w3_content, topic, file_path, uploaded_by):
#     db = SessionLocal()
#     try:
#         item = TrainingContent(
#             title=title,
#             content_type=content_type,
#             w3_content=w3_content,
#             topic=topic,
#             file_path=file_path,
#             uploaded_by=uploaded_by
#         )
#         db.add(item)
#         db.commit()
#         db.refresh(item)
#         return {"message": "Training content created", "id": item.id}
#     except Exception as e:
#         return {"error": str(e)}
#     finally:
#         db.close()
from app.db.session import SessionLocal
from app.models.training_model import TrainingContent


def get_all_training_content():
    db = SessionLocal()
    try:
        items = db.query(TrainingContent).all()
        return [
            {
                "id": item.id,
                "title": item.title,
                "content_type": item.content_type,
                "file_path": item.file_path,
                "w3_content": item.w3_content,
                "topic": item.topic,
                "created_at": str(item.created_at)
            }
            for item in items
        ]
    finally:
        db.close()


def create_training_content(title, content_type, w3_content, topic, file_path, uploaded_by):
    db = SessionLocal()
    try:
        item = TrainingContent(
            title=title,
            content_type=content_type,
            w3_content=w3_content,
            topic=topic,
            file_path=file_path,
            uploaded_by=uploaded_by
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {"message": "Training content created", "id": item.id}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()