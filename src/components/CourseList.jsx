import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { List, Rate, Tag } from "antd";

import { fetchDataCourse } from "../redux/currentCourseSlice";

export default function CourseList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.courses.data);
  const [pageNumber, setPageNumber] = useState(1);

  const onClickCourse = (currentId) => {
    dispatch(fetchDataCourse(currentId));
    navigate(`/course/${currentId}`);
  };

  return (
    <List
      dataSource={courses}
      itemLayout="vertical"
      size="large"
      pagination={{
        pageSize: 10,
        align: "center",
        total: courses.length,
        onChange: setPageNumber,
        defaultCurrent: pageNumber,
      }}
      renderItem={(item) => (
        <List.Item
          key={item.title}
          extra={
            <img
              className="previewImageLink"
              src={`${item.previewImageLink}/cover.webp`}
              alt="img"
            />
          }
        >
          <List.Item.Meta
            title={<a onClick={() => onClickCourse(item.id)}>{item.title}</a>}
            description={item.description}
          />
          <div>Amount Lessons: {item.lessonsCount}</div>
          <div>
            Rating: <Rate allowHalf defaultValue={item.rating} />
          </div>
          {item.meta.skills && (
            <div>
              Skills:
              {item.meta.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          )}
        </List.Item>
      )}
    />
  );
}
