package com.Financial_Tracking_API.Financial_Tracking_API.Exceptions;


import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="exceptions")
@Data
@Builder
@Getter
public class Exceptions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer exceptionId;

    private String exceptionName;

    private String regexRule;
}
