from geopy.distance import geodesic

def check_distance(teacher_lat, teacher_lng, student_lat, student_lng):
    teacher_pos = (teacher_lat, teacher_lng)
    student_pos = (student_lat, student_lng)

    distance = geodesic(teacher_pos, student_pos).kilometers

    return distance
